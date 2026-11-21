from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from apps.notifications.models import DeadLetterStatus, NotificationDeadLetter, NotificationOutbox, OutboxStatus
from apps.notifications.monitoring.metrics import inc
from apps.notifications.services.eventsourcing import append_event

RETRYABLE_CODES = {"ConnectionError", "TimeoutError", "RedisError", "URLError"}

def retry_delay(attempt):
    return min(settings.OUTBOX_RETRY_MAX_SECONDS, settings.OUTBOX_RETRY_BASE_SECONDS * (2 ** max(attempt - 1, 0)))

def claim_outbox_event(outbox_id):
    with transaction.atomic():
        event = NotificationOutbox.objects.select_for_update().select_related("notification").get(pk=outbox_id)
        if event.status not in {OutboxStatus.PENDING, OutboxStatus.FAILED}: return None
        if event.available_at > timezone.now(): return None
        event.status=OutboxStatus.PROCESSING; event.locked_at=timezone.now(); event.attempt_count+=1
        event.save(update_fields=["status","locked_at","attempt_count","updated_at"])
        return event

def mark_processed(event):
    event.status=OutboxStatus.PROCESSED; event.processed_at=timezone.now(); event.locked_at=None; event.last_error_code=""; event.last_error_summary=""
    event.save(update_fields=["status","processed_at","locked_at","last_error_code","last_error_summary","updated_at"])
    inc("notification_outbox_processed_total")

def mark_failed(event, exc):
    code=type(exc).__name__; summary=str(exc)[:500]; now=timezone.now()
    event.last_error_code=code; event.last_error_summary=summary; event.locked_at=None
    if event.attempt_count >= settings.OUTBOX_MAX_ATTEMPTS:
        event.status=OutboxStatus.DEAD_LETTERED
        event.save(update_fields=["status","locked_at","last_error_code","last_error_summary","updated_at"])
        NotificationDeadLetter.objects.update_or_create(outbox_event=event, defaults={"notification":event.notification,"event_type":event.event_type,"payload":event.payload,"failure_reason":summary or code,"failure_code":code,"retry_count":event.attempt_count,"status":DeadLetterStatus.OPEN,"first_failed_at":now,"last_attempt_at":now})
        append_event(aggregate_type="Notification",aggregate_id=event.notification_id,event_type="notification.dead_lettered",correlation_id=event.notification.correlation_id,payload={"outbox_event_id":event.pk,"failure_code":code,"retry_count":event.attempt_count})
        inc("notification_dead_letters_total")
        return False
    event.status=OutboxStatus.FAILED
    event.available_at=now+timedelta(seconds=retry_delay(event.attempt_count))
    event.save(update_fields=["status","available_at","locked_at","last_error_code","last_error_summary","updated_at"])
    inc("notification_outbox_retries_total")
    return True

def requeue_dead_letter(dead_letter, actor=None):
    now=timezone.now(); event=dead_letter.outbox_event
    with transaction.atomic():
        event.status=OutboxStatus.PENDING; event.attempt_count=0; event.available_at=now; event.locked_at=None; event.processed_at=None; event.last_error_code=""; event.last_error_summary=""
        event.save()
        dead_letter.status=DeadLetterStatus.REQUEUED; dead_letter.requeued_at=now
        dead_letter.save(update_fields=["status","requeued_at","updated_at"])
        from notifications.models import NotificationAuditEvent
        NotificationAuditEvent.objects.create(notification=event.notification,actor=actor,action="dead_letter_requeued",correlation_id=event.notification.correlation_id,metadata={"dead_letter_id":dead_letter.pk,"outbox_event_id":event.pk})
    append_event(aggregate_type="Notification",aggregate_id=event.notification_id,event_type="notification.requeued",correlation_id=event.notification.correlation_id,actor=actor,payload={"dead_letter_id":dead_letter.pk})
    inc("notification_dead_letters_requeued_total")
    return event
