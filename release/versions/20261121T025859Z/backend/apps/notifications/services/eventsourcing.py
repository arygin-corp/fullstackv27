import json
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from apps.notifications.models import NotificationEvent, NotificationEventCheckpoint
from apps.notifications.monitoring.metrics import inc
from apps.notifications.ledger import append_ledger_entry
SENSITIVE_KEYS={"token","webhook_url","api_key","authorization","password","body"}
def sanitize_payload(payload):
    raw=json.dumps(payload,default=str)
    if len(raw.encode())>settings.EVENT_SOURCING_MAX_PAYLOAD_BYTES: raise ValueError("Event payload exceeds configured size limit")
    return {k:v for k,v in (payload or {}).items() if k.lower() not in SENSITIVE_KEYS}
def _append_event_once(*,aggregate_type,aggregate_id,event_type,correlation_id,payload=None,actor=None,causation_id=None,occurred_at=None,tenant=None,application=None):
    if not settings.EVENT_SOURCING_ENABLED: return None
    occurred_at=occurred_at or timezone.now(); aggregate_id=str(aggregate_id); clean=sanitize_payload(payload or {})
    with transaction.atomic():
        latest=NotificationEvent.objects.select_for_update().filter(aggregate_type=aggregate_type,aggregate_id=aggregate_id).order_by("-aggregate_version").first()
        version=(latest.aggregate_version if latest else 0)+1
        event=NotificationEvent.objects.create(tenant=tenant,application=application,aggregate_type=aggregate_type,aggregate_id=aggregate_id,aggregate_version=version,event_type=event_type,payload=clean,actor=actor,correlation_id=correlation_id,causation_id=causation_id,occurred_at=occurred_at)
        append_ledger_entry(event_type=event_type,aggregate_type=aggregate_type,aggregate_id=aggregate_id,correlation_id=correlation_id,payload=clean,actor=actor,tenant=tenant,application=application,occurred_at=occurred_at)
    inc("notification_eventsourced_total",labels={"event_type":event_type}); return event
def append_event(**kwargs):
    last=None
    for _ in range(3):
        try: return _append_event_once(**kwargs)
        except IntegrityError as exc: last=exc
    raise last
def notification_state_from_events(notification_id):
    state={"id":str(notification_id),"read":False,"is_deleted":False,"deliveries":{},"last_version":0}
    for event in NotificationEvent.objects.filter(aggregate_type="Notification",aggregate_id=str(notification_id)).order_by("aggregate_version"):
        t,p=event.event_type,event.payload
        if t=="notification.created": state.update({"title":p.get("title",""),"notification_type":p.get("notification_type","system"),"recipient_id":p.get("recipient_id")})
        elif t=="notification.read": state["read"]=True
        elif t=="notification.unread": state["read"]=False
        elif t in {"notification.dismissed","notification.deleted"}: state["is_deleted"]=True
        elif t=="notification.restored": state["is_deleted"]=False
        elif t.startswith("notification.delivery."): state["deliveries"][p.get("channel","unknown")]=t.rsplit(".",1)[-1]
        state["last_version"]=event.aggregate_version
    return state
def replay_projection(name="notification_state",limit=None):
    checkpoint,_=NotificationEventCheckpoint.objects.get_or_create(projection_name=name); qs=NotificationEvent.objects.order_by("created_at","id")
    if checkpoint.last_created_at: qs=qs.filter(created_at__gt=checkpoint.last_created_at)
    if limit: qs=qs[:limit]
    count=0; last=None
    for event in qs.iterator(): count+=1; last=event
    if last:
        checkpoint.last_event_id=last.event_id; checkpoint.last_created_at=last.created_at; checkpoint.processed_count+=count; checkpoint.save()
    return count
