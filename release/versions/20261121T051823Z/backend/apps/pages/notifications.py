from apps.notifications.models import NotificationType
from apps.notifications.services.ingress import publish


def notify(user, subject, body, action_url=""):
    """Deliver a page notice through the Notifications inbox."""
    notification, _created = publish(
        recipient=user,
        title=subject,
        body=body,
        url=action_url,
        notification_type=NotificationType.SYSTEM,
        source="pages",
    )
    return notification
