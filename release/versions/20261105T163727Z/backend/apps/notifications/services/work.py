"""Bring approvals and alerts from other apps into the notification inbox."""
import logging

from django.apps import apps
from django.db.models.signals import post_save

from apps.notifications.models import NotificationType
from apps.notifications.services.ingress import notification_type_for, publish, publish_for_email

logger = logging.getLogger(__name__)


def _on_intake_notification(sender, instance, created, **kwargs):
    if not created:
        return
    publish_for_email(
        email=instance.recipient_email,
        title=instance.title,
        body=instance.message,
        url=instance.action_url,
        notification_type=notification_type_for(instance.event),
        source="product_intake",
        source_object_type="ProductIntake",
        source_object_id=instance.intake_id,
        idempotency_key=f"intake-notification:{instance.pk}",
    )


def _on_changelog_notification(sender, instance, created, **kwargs):
    if not created:
        return
    publish(
        recipient=instance.user,
        title=instance.title,
        body=instance.message,
        notification_type=NotificationType.SYSTEM,
        source="changelog",
        source_object_type="Post",
        source_object_id=instance.post_id,
        idempotency_key=f"changelog-notification:{instance.pk}",
    )


def _on_approval_task(sender, instance, created, **kwargs):
    if not created or not instance.assigned_to_id or instance.status != instance.Status.PENDING:
        return
    workflow = getattr(instance, "instance", None)
    publish(
        recipient=instance.assigned_to,
        title="Approval needed",
        body=f"{workflow} is waiting for your decision." if workflow else "A workflow is waiting for your decision.",
        notification_type=NotificationType.APPROVAL,
        source="workflow",
        source_object_type="ApprovalTask",
        source_object_id=instance.pk,
        idempotency_key=f"approval-task:{instance.pk}",
    )


def _connect(app_label, model_name, handler, uid):
    try:
        model = apps.get_model(app_label, model_name)
    except LookupError:
        return
    post_save.connect(handler, sender=model, dispatch_uid=uid)


def autodiscover_work_adapters():
    _connect("intake", "UserNotification", _on_intake_notification, "notifications.intake.user_notification")
    _connect("changelog", "Notification", _on_changelog_notification, "notifications.changelog.notification")
    _connect("workflow_engine", "ApprovalTask", _on_approval_task, "notifications.workflow.approval_task")
    logger.debug("Notification work adapters registered")
