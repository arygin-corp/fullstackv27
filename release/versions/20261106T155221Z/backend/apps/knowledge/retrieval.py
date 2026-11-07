from dataclasses import dataclass, replace
from django.conf import settings
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from pgvector.django import CosineDistance
from ai_providers.factory import get_embedding_provider
from .models import DocumentChunk
from .query_expansion import expand_query
from .reranking import rerank

@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: int
    document_id: int
    document_title: str
    content: str
    position: int
    distance: float | None = None
    vector_score: float = 0.0
    keyword_score: float = 0.0
    fusion_score: float = 0.0
    rerank_score: float | None = None
    matched_queries: tuple[str, ...] = ()
    def with_rerank(self, score):
        return replace(self, rerank_score=score)


def _row_to_chunk(row, **scores):
    return RetrievedChunk(row.id, row.document_id, row.document.title, row.content, row.position, **scores)


def _vector_results(query, user, candidate_k):
    vector = get_embedding_provider().embed(query)
    if settings.RAG_RETRIEVAL_PROVIDER == "azure_ai_search":
        from .azure_search import vector_search
        rows = vector_search(vector, user.id, candidate_k)
        return [RetrievedChunk(int(r["id"]), int(r["document_id"]), r["document_title"], r["content"], int(r["position"]), distance=1.0-float(r.get("@search.score", 0.0)), vector_score=float(r.get("@search.score", 0.0))) for r in rows]
    rows = (DocumentChunk.objects.filter(document__owner=user).select_related("document")
            .annotate(distance=CosineDistance("embedding", vector)).order_by("distance")[:candidate_k])
    return [_row_to_chunk(r, distance=float(r.distance), vector_score=max(0.0, 1.0-float(r.distance))) for r in rows]


def _keyword_results(query, user, candidate_k):
    search_query = SearchQuery(query, search_type="websearch")
    vector = SearchVector("content", weight="A") + SearchVector("document__title", weight="B")
    rows = (DocumentChunk.objects.filter(document__owner=user).select_related("document")
            .annotate(search=vector, rank=SearchRank(vector, search_query))
            .filter(search=search_query).order_by("-rank")[:candidate_k])
    return [_row_to_chunk(r, keyword_score=float(r.rank)) for r in rows]


def _rrf_merge(result_sets):
    merged = {}
    query_hits = {}
    for source, query, results, weight in result_sets:
        for rank, item in enumerate(results, 1):
            score = weight / (settings.RAG_RRF_K + rank)
            current = merged.get(item.chunk_id)
            if current is None:
                current = item
            current = replace(
                current,
                distance=item.distance if item.distance is not None else current.distance,
                vector_score=max(current.vector_score, item.vector_score),
                keyword_score=max(current.keyword_score, item.keyword_score),
                fusion_score=current.fusion_score + score,
            )
            merged[item.chunk_id] = current
            query_hits.setdefault(item.chunk_id, set()).add(query)
    values = [replace(item, matched_queries=tuple(sorted(query_hits[item.chunk_id]))) for item in merged.values()]
    return sorted(values, key=lambda item: item.fusion_score, reverse=True)


def retrieve_chunks(question, user, top_k=None):
    if settings.RAG_RETRIEVAL_PROVIDER not in {"pgvector", "azure_ai_search"}:
        raise ValueError(f"Unsupported RAG_RETRIEVAL_PROVIDER: {settings.RAG_RETRIEVAL_PROVIDER}")
    final_k = top_k or settings.RAG_TOP_K
    candidate_k = max(final_k, settings.RAG_CANDIDATE_K)
    queries = expand_query(question)
    sets = []
    for query in queries:
        sets.append(("vector", query, _vector_results(query, user, candidate_k), settings.RAG_VECTOR_WEIGHT))
        if settings.RAG_HYBRID_ENABLED and settings.RAG_RETRIEVAL_PROVIDER == "pgvector":
            sets.append(("keyword", query, _keyword_results(query, user, candidate_k), settings.RAG_KEYWORD_WEIGHT))
    candidates = _rrf_merge(sets)[:candidate_k]
    return rerank(question, candidates, final_k)
