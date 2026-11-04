import hashlib
from django.conf import settings
from django.db import transaction
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
