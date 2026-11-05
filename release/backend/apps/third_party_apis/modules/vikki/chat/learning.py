import hashlib
import re

from django.conf import settings
from django.db.models import F
from django.utils import timezone
from pgvector.django import CosineDistance

from ai_providers.factory import get_embedding_provider

from .models import LearnedExchange

_FOLLOW_UP = re.compile(
    r"^(yes|yeah|yep|no|nope|ok|okay|sure|thanks|thank you|please|tell me more|more|go on|continue|elaborate|explain that|explain this|what about|what else|and why|and what|how so|why not)\b"
    r"|\b(that|this|it|they|those|them|the same)\b",
    re.IGNORECASE,
)


def normalize_question(value):
    text = re.sub(r"[^\w\s]", " ", (value or "").casefold())
    return " ".join(text.split())


def question_key(value):
    return hashlib.sha256(normalize_question(value).encode("utf-8")).hexdigest()


def is_follow_up(question):
    text = (question or "").strip()
    if not text:
        return False
    return bool(_FOLLOW_UP.search(text))


def resolve_question(question, history):
    """Turn a follow-up into a standalone question using the previous turn."""
    asked = (question or "").strip()
    if not asked or not is_follow_up(asked):
        return asked
    previous_user, previous_assistant = _previous_turn(history)
    if not previous_user:
        return asked
    snippet = " ".join((previous_assistant or "").split())[:240]
    if snippet:
        return f"{previous_user} Follow-up: {asked} Prior answer: {snippet}"
    return f"{previous_user} Follow-up: {asked}"


def recall(user, question, allow_similar=True):
    """Return a stored answer for this question, plus an embedding when one was computed."""
    key = question_key(question)
    exact = LearnedExchange.objects.filter(user=user, question_key=key).first()
    if exact:
        _touch(exact)
        return _payload(exact), None
    if not allow_similar:
        return None, None
    vector = _embed(question)
    if vector is None:
        return None, None
    nearest = (
        LearnedExchange.objects.filter(user=user, embedding__isnull=False)
        .annotate(distance=CosineDistance("embedding", vector))
        .order_by("distance")
        .first()
    )
    limit = getattr(settings, "VIKKI_LEARNED_DISTANCE", 0.18)
    if nearest is None or float(nearest.distance) > limit:
        return None, vector
    _touch(nearest)
    return _payload(nearest), vector


def remember(user, question, payload, vector=None, asked=""):
    answer = (payload.get("answer") or "").strip()
    if not answer:
        return None
    if vector is None:
        vector = _embed(question)
    existing = LearnedExchange.objects.filter(user=user, question_key=question_key(question)).first()
    if existing and existing.answer != answer:
        _drop_index(existing)
    exchange, _ = LearnedExchange.objects.update_or_create(
        user=user,
        question_key=question_key(question),
        defaults={
            "question": question,
            "asked_question": (asked or question)[:10000],
            "normalized_question": normalize_question(question),
            "answer": answer,
            "citations": payload.get("citations") or [],
            "recommendations": payload.get("recommendations") or [],
            "suggestions": payload.get("suggestions") or [],
            "embedding": vector,
        },
    )
    return exchange


def mark_helpful(user, question, answer=""):
    exchange = _find(user, question, answer)
    if exchange is None:
        return None
    return promote(exchange)


def apply_correction(user, question, correction, answer=""):
    correction = (correction or "").strip()
    question = (question or "").strip()
    if not question or not correction:
        return None
    exchange = _find(user, question, answer)
    if exchange is None:
        exchange = LearnedExchange(
            user=user,
            question_key=question_key(question),
            question=question,
            asked_question=question,
            normalized_question=normalize_question(question),
            hit_count=1,
        )
    _drop_index(exchange)
    exchange.answer = correction
    exchange.asked_question = question
    if exchange.embedding is None:
        exchange.embedding = _embed(exchange.question or question)
    exchange.save()
    return exchange


def promote(exchange):
    if exchange.knowledge_document_id:
        return exchange
    document = _index(exchange.user, exchange.asked_question or exchange.question, exchange.answer)
    if document is None:
        return exchange
    exchange.knowledge_document_id = document.id
    exchange.save(update_fields=["knowledge_document_id", "updated_at"])
    return exchange


def _payload(exchange):
    return {
        "answer": exchange.answer,
        "citations": exchange.citations or [],
        "recommendations": exchange.recommendations or [],
        "suggestions": exchange.suggestions or [],
        "cached": True,
    }


def _touch(exchange):
    LearnedExchange.objects.filter(pk=exchange.pk).update(hit_count=F("hit_count") + 1, last_used_at=timezone.now())
    exchange.refresh_from_db(fields=["hit_count", "knowledge_document_id", "asked_question", "question", "answer", "user_id"])
    if exchange.hit_count >= 2:
        promote(exchange)


def _find(user, question, answer=""):
    question = (question or "").strip()
    if question:
        exact = LearnedExchange.objects.filter(user=user, question_key=question_key(question)).first()
        if exact:
            return exact
        asked = LearnedExchange.objects.filter(user=user, asked_question=question).order_by("-last_used_at").first()
        if asked:
            return asked
    if answer:
        return LearnedExchange.objects.filter(user=user, answer=answer).order_by("-last_used_at").first()
    return None


def _previous_turn(history):
    previous_user = ""
    previous_assistant = ""
    for item in history or []:
        role = getattr(item, "role", "")
        content = getattr(item, "content", "")
        if isinstance(item, dict):
            role = item.get("role", role)
            content = item.get("content", content)
        if role == "user" and content:
            previous_user = content.strip()
        elif role == "assistant" and content:
            previous_assistant = content.strip()
    return previous_user, previous_assistant


def _embed(question):
    try:
        return get_embedding_provider().embed(question)
    except Exception:
        return None


def _index(user, question, answer):
    try:
        from apps.knowledge.services import index_text
        title = f"Learned: {question}"[:255]
        return index_text(user, title, f"Question: {question}\nAnswer: {answer}")
    except Exception:
        return None


def _drop_index(exchange):
    document_id = exchange.knowledge_document_id
    if not document_id:
        return
    try:
        from apps.knowledge.models import Document
        document = Document.objects.filter(pk=document_id, owner_id=exchange.user_id).first()
        if document is not None:
            document.source_file.delete(save=False)
            document.delete()
    except Exception:
        return
    exchange.knowledge_document_id = None
    if exchange.pk:
        exchange.save(update_fields=["knowledge_document_id", "updated_at"])
