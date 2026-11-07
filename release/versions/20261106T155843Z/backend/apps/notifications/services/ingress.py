"""Single entry point for other apps to deliver a user notification."""
import logging

from apps.notifications.models import NotificationType

logger = logging.getLogger(__name__)

APPROVAL_EVENTS = {"review_required", "approval_requested", "pending_approval"}
GOVERNANCE_EVENTS = {"intake_rejected", "intake_approved", "intake_resubmitted"}


def notification_type_for(event, default=NotificationType.SYSTEM):
    if event in APPROVAL_EVENTS:
        return NotificationType.APPROVAL
    if event in GOVERNANCE_EVENTS:
        return NotificationType.GOVERNANCE
    return default


def publish(*, recipient, title, body="", url="", notification_type=None, source="application", source_object_type="", source_object_id="", idempotency_key=None):
    """Create an in-app notification. Failures stay in this module and do not break the caller."""
    from apps.notifications.services.notifications import NotificationService

    try:
        return NotificationService.create(
            recipient=recipient,
            title=(title or "Notification").strip(),
            body=body or "",
            url=url or "",
            notification_type=notification_type or NotificationType.SYSTEM,
            source=source or "application",
            source_object_type=source_object_type or "",
            source_object_id=str(source_object_id or ""),
            idempotency_key=idempotency_key,
        )
    except Exception:
        logger.exception("Could not publish notification %s", idempotency_key or title)
        return None, False


def publish_for_email(*, email, **kwargs):
    from django.contrib.auth import get_user_model

    address = (email or "").strip()
    if not address:
        return None, False
    recipient = get_user_model().objects.filter(email__iexact=address, is_active=True).order_by("id").first()
    if recipient is None:
        return None, False
    return publish(recipient=recipient, **kwargs)
