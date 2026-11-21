import json
import re
from functools import lru_cache
from django.conf import settings
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider

@lru_cache(maxsize=1)
def _cross_encoder():
    from sentence_transformers import CrossEncoder
    return CrossEncoder(settings.RAG_RERANK_MODEL)


def _cross_encoder_rerank(question, candidates, limit):
    pairs = [(question, item.content) for item in candidates]
    scores = _cross_encoder().predict(pairs)
    ranked = sorted(zip(candidates, scores), key=lambda pair: float(pair[1]), reverse=True)
    return [item.with_rerank(float(score)) for item, score in ranked[:limit]]


def _llm_rerank(question, candidates, limit):
    payload = [{"id": item.chunk_id, "title": item.document_title, "content": item.content[:1600]} for item in candidates]
    prompt = """Rank document chunks by usefulness for answering the question. Return only a JSON array of chunk IDs, best first. Do not answer the question.\nQuestion: {question}\nChunks: {chunks}""".format(question=question, chunks=json.dumps(payload))
    result = get_chat_provider().complete([ChatMessage("system", "You are a retrieval reranker."), ChatMessage("user", prompt)])
    match = re.search(r"\[[\s\S]*\]", result)
    ids = json.loads(match.group(0) if match else result)
    mapping = {item.chunk_id: item for item in candidates}
    ordered = [mapping[int(item)] for item in ids if str(item).isdigit() and int(item) in mapping]
    ordered.extend(item for item in candidates if item.chunk_id not in {x.chunk_id for x in ordered})
    return [item.with_rerank(1.0 - rank / max(len(ordered), 1)) for rank, item in enumerate(ordered[:limit])]


def rerank(question, candidates, limit=None):
    limit = limit or settings.RAG_RERANK_TOP_N
    mode = settings.RAG_RERANKER
    if mode == "rrf":
        return candidates[:limit]
    if mode == "cross_encoder":
        return _cross_encoder_rerank(question, candidates, limit)
    if mode == "llm":
        try:
            return _llm_rerank(question, candidates, limit)
        except Exception:
            return candidates[:limit]
    raise ValueError(f"Unsupported RAG_RERANKER: {mode}")
