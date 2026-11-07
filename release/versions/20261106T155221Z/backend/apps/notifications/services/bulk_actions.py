from django.db import transaction
from django.utils import timezone
from apps.notifications.models import Notification,NotificationAuditEvent
from .search import search_notifications
ALLOWED={"read","unread","archive","restore","pin","unpin","snooze","dismiss"}
@transaction.atomic
def apply_bulk_action(*,user,ids,action,snoozed_until=None,actor=None):
    if action not in ALLOWED: raise ValueError("Unsupported bulk action")
    records=list(search_notifications(user=user,filters={"lifecycle":"active"}).filter(pk__in=ids).select_for_update())
    now=timezone.now()
    for n in records:
        if action=="read": n.read=True;n.read_at=now
        elif action=="unread": n.read=False;n.read_at=None
        elif action=="archive": n.lifecycle="archived";n.archived_at=now
        elif action=="restore": n.lifecycle="active";n.archived_at=None;n.snoozed_until=None
        elif action=="pin": n.pinned=True
        elif action=="unpin": n.pinned=False
        elif action=="snooze":
            if not snoozed_until or snoozed_until<=now: raise ValueError("Future snooze time required")
            n.lifecycle="snoozed";n.snoozed_until=snoozed_until
        elif action=="dismiss": n.lifecycle="dismissed";n.is_deleted=True;n.dismissed_at=now
        n.save()
        NotificationAuditEvent.objects.create(notification=n,actor=actor or user,action=f"bulk_{action}",correlation_id=n.correlation_id,metadata={"bulk":True})
    return len(records)
