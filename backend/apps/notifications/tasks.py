from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from notifications.models import DeliveryChannel, DeliveryStatus, DigestFrequency, Notification, NotificationDelivery, NotificationDigest, NotificationOutbox, NotificationPreference, OutboxStatus, PushDeliveryReceipt
from notifications.monitoring.alerts import evaluate_alerts
from notifications.monitoring.metrics import inc, set_gauge
from notifications.services.digests import build_digest
from notifications.services.events import publish_notification
from notifications.services.teams import send_to_teams
from notifications.secrets import resolve_secret
from notifications.services.push import PushDisabled, send_push
from notifications.services.eventsourcing import append_event
from notifications.services.outbox import claim_outbox_event, mark_failed, mark_processed
from notifications.telemetry import span
try:
    from celery import shared_task
except ImportError:
    def shared_task(*dargs, **dkwargs):
        def decorate(fn): return fn
        return decorate

def _finish(delivery, ok, code=""):
    delivery.status=DeliveryStatus.DELIVERED if ok else DeliveryStatus.FAILED
    delivery.delivered_at=timezone.now() if ok else None; delivery.failure_code=code
    delivery.save(update_fields=["status","delivered_at","failure_code","updated_at"])
    inc("notification_delivery_success_total" if ok else "notification_delivery_failures_total",labels={"channel":delivery.channel})
    append_event(aggregate_type="Notification",aggregate_id=delivery.notification_id,event_type="notification.delivery.succeeded" if ok else "notification.delivery.failed",correlation_id=delivery.notification.correlation_id,payload={"channel":delivery.channel,"failure_code":code})

def _attempt(delivery):
    delivery.status=DeliveryStatus.PROCESSING; delivery.attempt_count+=1; delivery.last_attempt_at=timezone.now()
    delivery.save(update_fields=["status","attempt_count","last_attempt_at","updated_at"])
    append_event(aggregate_type="Notification",aggregate_id=delivery.notification_id,event_type="notification.delivery.started",correlation_id=delivery.notification.correlation_id,payload={"channel":delivery.channel,"attempt_count":delivery.attempt_count})
    if delivery.attempt_count>1: inc("notification_task_retries_total",labels={"channel":delivery.channel})

@shared_task(bind=True, autoretry_for=(ConnectionError,), retry_backoff=True, retry_jitter=True, retry_kwargs={"max_retries":5})
def deliver_notification(self, notification_id=None):
    if notification_id is None: notification_id=self
    n=Notification.objects.select_related("recipient").get(pk=notification_id,is_deleted=False)
    for d in n.deliveries.all():
        if d.status==DeliveryStatus.DELIVERED: continue
        _attempt(d)
        try:
            if d.channel==DeliveryChannel.IN_APP: ok=publish_notification(n)
            elif d.channel==DeliveryChannel.EMAIL:
                ok=bool(n.recipient.email) and send_mail(n.title,n.body,settings.DEFAULT_FROM_EMAIL,[n.recipient.email],fail_silently=False)>0
            elif d.channel==DeliveryChannel.TEAMS:
                destination=getattr(n.recipient,"teams_notification_destination",None)
                ok=bool(destination and destination.is_active and send_to_teams(resolve_secret(destination.webhook_secret_reference,destination.webhook_url),n))
            elif d.channel==DeliveryChannel.DIGEST: ok=True
            elif d.channel==DeliveryChannel.PUSH:
                if not settings.MOBILE_PUSH_ENABLED:
                    raise PushDisabled("Mobile push is disabled")
                devices=n.recipient.push_devices.filter(is_active=True)
                accepted=0
                for device in devices:
                    try:
                        result,code,summary=send_push(device,n)
                        PushDeliveryReceipt.objects.update_or_create(delivery=d,device=device,defaults={"accepted":result,"response_code":code,"response_summary":summary[:500]})
                        accepted+=int(result)
                    except PushDisabled:
                        raise
                    except Exception as exc:
                        device.failure_count+=1
                        if device.failure_count>=settings.MOBILE_PUSH_DISABLE_AFTER_FAILURES:
                            device.is_active=False; device.disabled_at=timezone.now()
                        device.save(update_fields=["failure_count","is_active","disabled_at","updated_at"])
                        PushDeliveryReceipt.objects.update_or_create(delivery=d,device=device,defaults={"accepted":False,"response_code":type(exc).__name__,"response_summary":str(exc)[:500]})
                ok=accepted>0
            else: ok=False
            _finish(d,ok,"" if ok else "channel_unavailable")
        except Exception as exc:
            _finish(d,False,type(exc).__name__); raise ConnectionError(str(exc))
    return True

@shared_task
def build_notification_digests():
    built=0
    for pref in NotificationPreference.objects.exclude(digest_frequency=DigestFrequency.OFF).select_related("user"):
        result=build_digest(pref.user,pref.digest_frequency)
        if not result: continue
        digest,items=result
        subject=f"{digest.get_frequency_display()} notification digest"
        delivered=bool(pref.user.email) and send_mail(subject,digest.content,settings.DEFAULT_FROM_EMAIL,[pref.user.email],fail_silently=False)>0
        digest.status=DeliveryStatus.DELIVERED if delivered else DeliveryStatus.FAILED
        digest.delivered_at=timezone.now() if delivered else None; digest.save(update_fields=["status","delivered_at"])
        if delivered: Notification.objects.filter(pk__in=[n.pk for n in items]).update(digest_sent_at=timezone.now())
        built+=1
    return built

@shared_task
def enforce_notification_retention():
    now=timezone.now(); read_cutoff=now-timedelta(days=settings.NOTIFICATION_READ_RETENTION_DAYS); unread_cutoff=now-timedelta(days=settings.NOTIFICATION_UNREAD_RETENTION_DAYS); deleted_cutoff=now-timedelta(days=settings.NOTIFICATION_DELETED_RETENTION_DAYS)
    soft_read=Notification.objects.active().filter(read=True,created_at__lt=read_cutoff).update(is_deleted=True,deleted_at=now)
    soft_unread=Notification.objects.active().filter(read=False,created_at__lt=unread_cutoff).update(is_deleted=True,deleted_at=now)
    purged,_=Notification.objects.filter(is_deleted=True,deleted_at__lt=deleted_cutoff).delete()
    return {"soft_deleted_read":soft_read,"soft_deleted_unread":soft_unread,"purged_objects":purged}

@shared_task
def collect_notification_monitoring():
    report=evaluate_alerts()
    for key,value in report["metrics"].items():
        if isinstance(value,(int,float)): set_gauge(f"notification_{key}",value)
    return report


@shared_task
def process_outbox_event(outbox_id):
    event = claim_outbox_event(outbox_id)
    if event is None:
        return False
    try:
        if event.event_type == "notification.dispatch":
            deliver_notification(event.notification_id)
        else:
            raise ValueError(f"Unsupported outbox event type: {event.event_type}")
        mark_processed(event)
        return True
    except Exception as exc:
        mark_failed(event, exc)
        return False

@shared_task
def process_outbox_batch(batch_size=None):
    batch_size = batch_size or settings.OUTBOX_BATCH_SIZE
    now = timezone.now()
    ids = list(NotificationOutbox.objects.filter(status__in=[OutboxStatus.PENDING, OutboxStatus.FAILED], available_at__lte=now).order_by("created_at", "id").values_list("id", flat=True)[:batch_size])
    return sum(1 for event_id in ids if process_outbox_event(event_id))

@shared_task
def recover_stale_outbox_locks():
    cutoff = timezone.now() - timedelta(seconds=settings.OUTBOX_LOCK_TIMEOUT_SECONDS)
    return NotificationOutbox.objects.filter(status=OutboxStatus.PROCESSING, locked_at__lt=cutoff).update(status=OutboxStatus.FAILED, available_at=timezone.now(), locked_at=None, last_error_code="stale_lock", last_error_summary="Recovered stale outbox processing lock")

# Backward-compatible alias retained for integrations created before the Phase 4 outbox.
def dispatch_notification(notification_id):
    return deliver_notification(notification_id)

@shared_task
def send_campaign(campaign_id):
    from django.db import transaction
    from notifications.models import NotificationCampaign
    from notifications.services.campaigns import CampaignService
    with transaction.atomic():
        campaign = NotificationCampaign.objects.select_for_update().get(pk=campaign_id)
        return CampaignService.send(campaign)

@shared_task
def dispatch_scheduled_campaigns(batch_size=25):
    from notifications.models import CampaignStatus, NotificationCampaign
    ids=list(NotificationCampaign.objects.filter(status__in=[CampaignStatus.APPROVED,CampaignStatus.SCHEDULED],scheduled_at__lte=timezone.now()).order_by("scheduled_at","id").values_list("id",flat=True)[:batch_size])
    return sum(send_campaign(campaign_id) for campaign_id in ids)


@shared_task
def generate_notification_summary(user_id, frequency="daily"):
    from django.contrib.auth import get_user_model
    from notifications.services.summaries import generate_summary
    with span("notification.summary.task", user_id=user_id, frequency=frequency):
        return generate_summary(get_user_model().objects.get(pk=user_id), frequency).pk

@shared_task
def generate_scheduled_notification_summaries(frequency="daily"):
    from django.contrib.auth import get_user_model
    from notifications.services.summaries import generate_summary
    count=0
    for user in get_user_model().objects.filter(is_active=True).iterator():
        generate_summary(user,frequency); count+=1
    return count

@shared_task
def verify_audit_ledger():
    from notifications.ledger import create_checkpoint, verify_ledger
    record=verify_ledger()
    if record.status=="passed": create_checkpoint()
    return {"status":record.status,"checked_entries":record.checked_entries,"first_invalid_sequence":record.first_invalid_sequence}
