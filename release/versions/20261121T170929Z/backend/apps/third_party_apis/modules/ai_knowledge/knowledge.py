"""Knowledge context Vikki reads from the AI Knowledge module."""

from apps.knowledge.retrieval import retrieve_chunks
from apps.knowledge.search import search_documents, search_entities
from apps.third_party_apis.modules.vikki.chat.memory import active_memories

KNOWLEDGE_ROUTE_NAMES = (
    "api-document-search",
    "api-entities",
    "api-memories",
)


def knowledge_routes():
    from apps.third_party_apis.modules.vikki.chat.urls import urlpatterns

    return [route for route in urlpatterns if getattr(route, "name", None) in KNOWLEDGE_ROUTE_NAMES]


def context_for(user, question, limit=5):
    """Return the documents, entities, and memories Vikki can use for a question."""
    question = (question or "").strip()
    documents = []
    for chunk in list(retrieve_chunks(question, user))[:limit]:
        documents.append({
            "document_id": chunk.document_id,
            "title": chunk.document_title,
            "excerpt": (chunk.content or "")[:400],
        })
    if not documents:
        for document in search_documents(user, question)[:limit]:
            documents.append({
                "document_id": document.id,
                "title": document.title,
                "excerpt": (document.executive_summary or "")[:400],
            })
    entities = [
        {"type": entity.entity_type, "name": entity.canonical_name}
        for entity in search_entities(user, question)[:limit]
    ]
    memories = [
        {"kind": item.kind, "content": item.content}
        for item in active_memories(user)[:limit]
    ]
    return {"documents": documents, "entities": entities, "memories": memories}
