import json
import re
from collections import Counter
from django.conf import settings
from django.utils import timezone
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .models import DocumentEntity, Entity, EntityRelation, TimelineEvent

SCHEMA_PROMPT = """Analyze the supplied document text and return only valid JSON with this exact shape:
{
  "executive_summary": "grounded concise summary",
  "key_topics": ["topic"],
  "key_risks": ["risk explicitly stated or clearly described"],
  "key_actions": ["action explicitly stated"],
  "suggested_questions": ["question answerable from this document"],
  "entities": [{"type":"person|project|team|incident|system|date|policy|application", "name":"exact name", "description":"brief grounded description", "evidence":"short supporting excerpt"}],
  "relations": [{"subject":"exact entity name", "predicate":"short relationship verb", "object":"exact entity name", "evidence":"short supporting excerpt", "confidence":0.0}],
  "timeline": [{"date":"YYYY-MM-DD or null", "date_text":"exact source date text", "title":"event title", "description":"grounded event description", "event_type":"milestone|incident|decision|action|change|deadline", "entities":["exact entity name"], "evidence":"short supporting excerpt"}]
}
Do not invent facts. Omit unsupported risks, actions, entities, relations, and timeline events. Relations must connect two extracted entities. Timeline dates must use YYYY-MM-DD only when the source is explicit; otherwise use null and preserve date_text. Preserve identifiers and names exactly. Suggested questions must be answerable from the supplied text. Return no markdown."""

def _json_object(text):
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise ValueError("Knowledge extraction did not return JSON")
        value = json.loads(match.group(0))
    if not isinstance(value, dict):
        raise ValueError("Knowledge extraction returned an invalid object")
    return value

def _clean_list(value, limit=20):
    if not isinstance(value, list):
        return []
    result=[]
    for item in value:
        if isinstance(item, str) and item.strip() and item.strip() not in result:
            result.append(item.strip())
    return result[:limit]

def _normalize(value):
    return " ".join(value.casefold().split())

def enrich_document(document, text=None):
    if not settings.KNOWLEDGE_INTELLIGENCE_ENABLED:
        document.intelligence_status = document.IntelligenceStatus.DISABLED
        document.intelligence_error = ""
        document.intelligence_updated_at = timezone.now()
        document.save(update_fields=["intelligence_status", "intelligence_error", "intelligence_updated_at"])
        return document
    if text is None:
        from .loaders import load_text
        text = load_text(document.source_file)
    context = text[:settings.KNOWLEDGE_INTELLIGENCE_MAX_CHARS]
    try:
        raw = get_chat_provider().complete([ChatMessage("system", SCHEMA_PROMPT), ChatMessage("user", f"Document title: {document.title}\n\nDocument text:\n{context}")])
        data = _json_object(raw)
        entities = data.get("entities") if isinstance(data.get("entities"), list) else []
        allowed = set(settings.KNOWLEDGE_ENTITY_TYPES)
        collected = {}
        for item in entities:
            if not isinstance(item, dict):
                continue
            kind = str(item.get("type", "")).strip().lower()
            name = str(item.get("name", "")).strip()
            if kind not in allowed or not name:
                continue
            key = (kind, _normalize(name))
            bucket = collected.setdefault(key, {"name": name, "description": str(item.get("description", "")).strip(), "evidence": []})
            evidence = str(item.get("evidence", "")).strip()
            if evidence and evidence not in bucket["evidence"]:
                bucket["evidence"].append(evidence[:500])
        document.entity_links.all().delete()
        for (kind, normalized), item in collected.items():
            entity, created = Entity.objects.get_or_create(owner=document.owner, entity_type=kind, normalized_name=normalized, defaults={"canonical_name": item["name"], "description": item["description"]})
            if not created and item["description"] and not entity.description:
                entity.description=item["description"]; entity.save(update_fields=["description", "updated_at"])
            DocumentEntity.objects.create(document=document, entity=entity, mentions=max(1, len(item["evidence"])), evidence=item["evidence"])
        name_map={entity.normalized_name:entity for entity in Entity.objects.filter(owner=document.owner,document_links__document=document).distinct()}
        document.entity_relations.all().delete()
        if settings.KNOWLEDGE_GRAPH_ENABLED:
            for relation in data.get("relations",[]) if isinstance(data.get("relations"),list) else []:
                if not isinstance(relation,dict): continue
                subject=name_map.get(_normalize(str(relation.get("subject","")).strip())); object_entity=name_map.get(_normalize(str(relation.get("object","")).strip())); predicate=_normalize(str(relation.get("predicate","")).strip()).replace(" ","_")[:100]
                if not subject or not object_entity or subject.id==object_entity.id or not predicate: continue
                try: confidence=max(0.0,min(float(relation.get("confidence",1.0)),1.0))
                except (TypeError,ValueError): confidence=1.0
                EntityRelation.objects.get_or_create(owner=document.owner,document=document,subject=subject,predicate=predicate,object=object_entity,defaults={"evidence":str(relation.get("evidence","")).strip()[:1000],"confidence":confidence})
        document.timeline_events.all().delete()
        if settings.TIMELINE_ENABLED:
            from datetime import date
            for position,event in enumerate((data.get("timeline",[]) if isinstance(data.get("timeline"),list) else [])[:settings.TIMELINE_MAX_EVENTS_PER_DOCUMENT]):
                if not isinstance(event,dict): continue
                title=str(event.get("title","")).strip(); description=str(event.get("description","")).strip()
                if not title or not description: continue
                parsed=None; raw_date=event.get("date")
                if isinstance(raw_date,str) and raw_date:
                    try: parsed=date.fromisoformat(raw_date)
                    except ValueError: parsed=None
                timeline=TimelineEvent.objects.create(owner=document.owner,document=document,event_date=parsed,date_text=str(event.get("date_text","")).strip()[:120],title=title[:255],description=description,event_type=str(event.get("event_type","")).strip()[:80],evidence=str(event.get("evidence","")).strip()[:1000],position=position)
                linked=[name_map.get(_normalize(str(name))) for name in event.get("entities",[]) if isinstance(name,str)] if isinstance(event.get("entities"),list) else []
                timeline.entities.set([entity for entity in linked if entity])
        document.executive_summary = str(data.get("executive_summary", "")).strip()
        document.key_topics = _clean_list(data.get("key_topics"))
        document.key_risks = _clean_list(data.get("key_risks"))
        document.key_actions = _clean_list(data.get("key_actions"))
        document.suggested_questions = _clean_list(data.get("suggested_questions"), settings.KNOWLEDGE_SUGGESTED_QUESTION_COUNT)
        document.intelligence_status = document.IntelligenceStatus.COMPLETE
        document.intelligence_error = ""
    except Exception as exc:
        document.intelligence_status = document.IntelligenceStatus.FAILED
        document.intelligence_error = str(exc)[:2000]
    document.intelligence_updated_at = timezone.now()
    document.save(update_fields=["executive_summary", "key_topics", "key_risks", "key_actions", "suggested_questions", "intelligence_status", "intelligence_error", "intelligence_updated_at"])
    return document
