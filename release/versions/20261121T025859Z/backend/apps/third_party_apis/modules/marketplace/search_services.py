"""Lazy search-model loading shared by web and Celery processes."""
from functools import lru_cache

from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_search_model():
    """Load the sentence-transformer once per process, on first use."""
    return SentenceTransformer("all-MiniLM-L6-v2")


def encode_search_text(text):
    """Return a pgvector-compatible list for the supplied text."""
    return get_search_model().encode(text or "", show_progress_bar=False).tolist()
