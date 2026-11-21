import json
import re
from django.conf import settings
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider

PROMPT = """Rewrite the user's question into concise retrieval queries for a document search system.
Preserve names, identifiers, quoted phrases, dates, acronyms, and technical terms exactly.
Return only a JSON array of strings. Include the original question as the first item.
Do not answer the question. Produce no more than {count} queries."""


def _parse_array(text):
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\[[\s\S]*\]", text)
        if not match:
            return []
        try:
            value = json.loads(match.group(0))
        except json.JSONDecodeError:
            return []
    return [item.strip() for item in value if isinstance(item, str) and item.strip()] if isinstance(value, list) else []


def expand_query(question):
    if not settings.RAG_QUERY_EXPANSION_ENABLED:
        return [question]
    count = max(1, settings.RAG_QUERY_EXPANSION_COUNT)
    try:
        result = get_chat_provider().complete([
            ChatMessage("system", PROMPT.format(count=count)),
            ChatMessage("user", question),
        ])
        candidates = _parse_array(result)
    except Exception:
        candidates = []
    ordered = []
    for item in [question, *candidates]:
        if item not in ordered:
            ordered.append(item)
    return ordered[:count]
