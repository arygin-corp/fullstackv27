import hashlib
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from ai_providers.factory import get_embedding_provider
from .chunking import chunk_text
from .intelligence import enrich_document
from .loaders import load_text
from .models import Document, DocumentChunk

def current_embedding_model():
    return settings.OLLAMA_EMBEDDING_MODEL if settings.AI_EMBEDDING_PROVIDER == "ollama" else settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT

@transaction.atomic
def ingest_document(document):
    text = load_text(document.source_file)
    if not text.strip():
        raise ValueError("No extractable text was found in this file")
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    duplicate = Document.objects.exclude(pk=document.pk).filter(owner=document.owner, content_hash=digest).first()
    if duplicate:
        raise ValueError(f"This content is already indexed as '{duplicate.title}'")
    chunks = chunk_text(text, settings.RAG_CHUNK_SIZE, settings.RAG_CHUNK_OVERLAP)
    vectors = get_embedding_provider().embed_many(chunks)
    document.content_hash = digest
    document.intelligence_status = Document.IntelligenceStatus.PENDING
    document.save(update_fields=["content_hash", "intelligence_status"])
    document.chunks.all().delete()
    created = DocumentChunk.objects.bulk_create([
        DocumentChunk(document=document, position=i, content=content, metadata={"filename": document.source_file.name}, embedding_provider=settings.AI_EMBEDDING_PROVIDER, embedding_model=current_embedding_model(), embedding_version=1, embedding=vector)
        for i, (content, vector) in enumerate(zip(chunks, vectors, strict=True))
    ])
    enrich_document(document, text)
    return len(created)


def index_text(owner, title, text):
    """Index written knowledge without a second model pass."""
    text = (text or "").strip()
    if not text:
        return None
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    existing = Document.objects.filter(owner=owner, content_hash=digest).first()
    if existing:
        return existing
    document = Document(
        owner=owner,
        title=(title or "Learned question")[:255],
        content_hash=digest,
        executive_summary=text[:1000],
        intelligence_status=Document.IntelligenceStatus.COMPLETE,
        intelligence_updated_at=timezone.now(),
    )
    document.source_file.save(f"learned-{digest[:12]}.txt", ContentFile(text.encode("utf-8")), save=False)
    document.save()
    chunks = chunk_text(text, settings.RAG_CHUNK_SIZE, settings.RAG_CHUNK_OVERLAP)
    vectors = get_embedding_provider().embed_many(chunks)
    DocumentChunk.objects.bulk_create([
        DocumentChunk(
            document=document,
            position=i,
            content=content,
            metadata={"filename": document.source_file.name, "learned": True},
            embedding_provider=settings.AI_EMBEDDING_PROVIDER,
            embedding_model=current_embedding_model(),
            embedding_version=1,
            embedding=vector,
        )
        for i, (content, vector) in enumerate(zip(chunks, vectors, strict=True))
    ])
    return document
