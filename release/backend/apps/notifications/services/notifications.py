import logging
import uuid
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.conf import settings
from apps.notifications.models import DeliveryChannel, DeliveryStatus, Notification, NotificationAuditEvent, NotificationDelivery, NotificationOutbox, NotificationType
from apps.notifications.monitoring.metrics import inc
from .preferences import get_preferences
from .rules import evaluate_rules
from apps.notifications.telemetry import span
from .eventsourcing import append_event
from .tenancy import default_tenant, get_current_application, get_current_tenant
from .prioritization import assess_priority
from .fatigue import assess_fatigue

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def create(*, recipient, title, body="", url="", notification_type=NotificationType.SYSTEM, source="application", source_object_type="", source_object_id="", actor=None, correlation_id=None, idempotency_key=None, tenant=None, application=None):
        tenant=tenant or get_current_tenant() or default_tenant()
        application=application or get_current_application()
        if settings.MULTI_TENANCY_ENABLED and tenant is None: raise ValueError("Tenant context is required when multi-tenancy is enabled")
        if application and tenant and application.tenant_id != tenant.pk: raise ValueError("Application does not belong to tenant")
        if idempotency_key:
            existing = Notification.objects.filter(recipient=recipient, idempotency_key=idempotency_key).first()
            if existing: return existing, False
        pref = get_preferences(recipient)
        defaults = [c for c in [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL, DeliveryChannel.TEAMS, DeliveryChannel.DIGEST, DeliveryChannel.PUSH] if pref.allows(notification_type, c)]
        if not settings.MOBILE_PUSH_ENABLED:
            defaults = [c for c in defaults if c != DeliveryChannel.PUSH]
        channels, matched_rules = evaluate_rules(user=recipient, notification_type=notification_type, source=source, title=title, default_channels=defaults)
        if not channels: return None, False
        correlation_id = correlation_id or uuid.uuid4()
        try:
            with transaction.atomic():
                n = Notification.objects.create(tenant=tenant,application=application,recipient=recipient, notification_type=notification_type, title=title.strip(), body=body, url=url or "", source=source, source_object_type=source_object_type, source_object_id=source_object_id, created_by=actor, updated_by=actor, correlation_id=correlation_id, idempotency_key=idempotency_key)
                priority_assessment=assess_priority(n)
                fatigue_assessment,channels=assess_fatigue(n,channels)
                NotificationAuditEvent.objects.create(notification=n, actor=actor, action="created", correlation_id=correlation_id, metadata={"matched_rules": matched_rules, "channels": sorted(channels), "priority": priority_assessment.final_priority, "fatigue_decision": fatigue_assessment.decision})
                append_event(aggregate_type="Notification",aggregate_id=n.pk,event_type="notification.created",tenant=tenant,application=application,correlation_id=correlation_id,actor=actor,payload={"recipient_id":recipient.pk,"title":n.title,"notification_type":notification_type,"source":source,"channels":sorted(channels)})
                NotificationDelivery.objects.bulk_create([NotificationDelivery(notification=n, channel=c, status=DeliveryStatus.PENDING) for c in channels])
                outbox = NotificationOutbox.objects.create(tenant=tenant,application=application,notification=n, event_type="notification.dispatch", payload={"schema_version": 1, "notification_id": n.pk, "correlation_id": str(n.correlation_id), "channels": sorted(channels)}, available_at=timezone.now())
                outbox_id = outbox.pk
                def _dispatch():
                    try:
                        NotificationService.dispatch_outbox(outbox_id)
                    except Exception:
                        logger.exception("Notification %s was saved, but delivery dispatch failed", outbox_id)
                transaction.on_commit(_dispatch)
                inc("notification_created_total", labels={"type": notification_type})
                return n, True
        except IntegrityError:
            inc("notification_creation_failures_total", labels={"reason": "integrity"})
            if idempotency_key: return Notification.objects.get(recipient=recipient, idempotency_key=idempotency_key), False
            raise
    @staticmethod
    def dispatch_outbox(outbox_id):
        from django.conf import settings
        from apps.notifications.tasks import process_outbox_event
        if settings.NOTIFICATIONS_CELERY_ENABLED and hasattr(process_outbox_event, "delay"):
            process_outbox_event.delay(outbox_id)
        else:
            process_outbox_event(outbox_id)

    @staticmethod
    def dispatch(notification_id):
        outbox = NotificationOutbox.objects.filter(notification_id=notification_id, status="pending").order_by("id").first()
        if outbox:
            NotificationService.dispatch_outbox(outbox.pk)

    @staticmethod
    def set_read(*, notification, read, actor):
        notification.read=read; notification.read_at=timezone.now() if read else None; notification.updated_by=actor
        notification.save(update_fields=["read","read_at","updated_by","updated_at"])
        NotificationAuditEvent.objects.create(notification=notification,actor=actor,action="marked_read" if read else "marked_unread",correlation_id=notification.correlation_id)
        append_event(aggregate_type="Notification",aggregate_id=notification.pk,event_type="notification.read" if read else "notification.unread",correlation_id=notification.correlation_id,actor=actor,payload={})
        return notification
    @staticmethod
    def mark_all_read(*, user, actor):
        now=timezone.now(); records=list(Notification.objects.for_user(user).active().unread().only("id","correlation_id"))
        updated=Notification.objects.filter(id__in=[n.pk for n in records]).update(read=True,read_at=now,updated_by=actor,updated_at=now)
        NotificationAuditEvent.objects.bulk_create([NotificationAuditEvent(notification=n,actor=actor,action="marked_read",correlation_id=n.correlation_id,metadata={"bulk":True}) for n in records])
        return updated
