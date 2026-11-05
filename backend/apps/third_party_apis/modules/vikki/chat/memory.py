import json
import re
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .models import MemoryItem, MemoryProfile

MEMORY_PROMPT = """Extract only durable, useful memories explicitly stated by the user. Return only a JSON array of objects with keys kind and content. Allowed kinds: preference, fact, goal, project, instruction. Do not store passwords, access tokens, financial account data, medical details, protected characteristics, private details about other people, temporary requests, or facts inferred by the assistant. If nothing should be remembered, return []."""
SUMMARY_PROMPT = """Update a concise conversation memory summary. Preserve the user's goals, decisions, unresolved questions, constraints, and important context. Do not add facts. Do not include document passages verbatim. Return only the summary text."""

def normalize_memory(value):
    return " ".join(value.casefold().split())

def profile_for(user):
    profile, _ = MemoryProfile.objects.get_or_create(user=user, defaults={"enabled": settings.MEMORY_ENABLED})
    return profile

def active_memories(user):
    profile = profile_for(user)
    if not settings.MEMORY_ENABLED or not profile.enabled:
        return MemoryItem.objects.none()
    return MemoryItem.objects.filter(user=user, active=True)[:settings.MEMORY_MAX_ITEMS_IN_PROMPT]

def memory_prompt_block(user):
    profile = profile_for(user)
    if not settings.MEMORY_ENABLED or not profile.enabled:
        return ""
    lines=[]
    if profile.custom_instructions.strip():
        lines.append(f"User-provided instructions: {profile.custom_instructions.strip()}")
    for item in active_memories(user):
        lines.append(f"{item.get_kind_display()}: {item.content}")
    if not lines:
        return ""
    return "Use these user-managed memories only when relevant. Do not treat them as document evidence and do not cite them as sources.\n" + "\n".join(f"- {line}" for line in lines)

def _json_array(text):
    try: value=json.loads(text)
    except json.JSONDecodeError:
        match=re.search(r"\[[\s\S]*\]", text)
        if not match: return []
        try: value=json.loads(match.group(0))
        except json.JSONDecodeError: return []
    return value if isinstance(value,list) else []

@transaction.atomic
def extract_memories(user, conversation, message):
    profile=profile_for(user)
    if not settings.MEMORY_ENABLED or not settings.MEMORY_AUTOMATIC_EXTRACTION or not profile.enabled:
        return []
    text=message.content[:settings.MEMORY_EXTRACTION_MAX_CHARS]
    try:
        raw=get_chat_provider().complete([ChatMessage("system",MEMORY_PROMPT),ChatMessage("user",text)])
    except Exception:
        return []
    created=[]; allowed={x for x,_ in MemoryItem.Kind.choices}
    for item in _json_array(raw):
        if not isinstance(item,dict): continue
        kind=str(item.get("kind","")).strip().lower(); content=str(item.get("content","")).strip()
        if kind not in allowed or not content or len(content)>1000: continue
        memory, was_created=MemoryItem.objects.get_or_create(user=user,kind=kind,normalized_content=normalize_memory(content),defaults={"content":content,"source":MemoryItem.Source.CONVERSATION,"source_conversation":conversation,"source_message":message,"confirmed":False})
        if was_created: created.append(memory)
    return created

def summarize_conversation(conversation, force=False):
    count=conversation.messages.count()
    if not force and count-conversation.summary_message_count < settings.MEMORY_SUMMARY_TRIGGER_MESSAGES:
        return conversation.summary
    messages=list(conversation.messages.order_by("created_at"))
    transcript="\n".join(f"{m.role}: {m.content}" for m in messages)
    transcript=transcript[-settings.MEMORY_SUMMARY_MAX_CHARS:]
    prompt=f"Existing summary:\n{conversation.summary or 'None'}\n\nRecent conversation:\n{transcript}"
    summary=get_chat_provider().complete([ChatMessage("system",SUMMARY_PROMPT),ChatMessage("user",prompt)]).strip()
    conversation.summary=summary
    conversation.summary_message_count=count
    conversation.summary_updated_at=timezone.now()
    conversation.save(update_fields=["summary","summary_message_count","summary_updated_at","updated_at"])
    return summary
