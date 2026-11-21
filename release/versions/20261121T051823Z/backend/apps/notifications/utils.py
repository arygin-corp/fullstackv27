from django.contrib.auth import get_user_model
from notifications.services import NotificationService

def create_notification(*, recipient=None, recipient_id=None, title, body="", url="", **kwargs):
    if recipient is None:
        if recipient_id is None: raise ValueError("recipient or recipient_id is required")
        recipient = get_user_model().objects.get(pk=recipient_id)
    notification, _ = NotificationService.create(recipient=recipient, title=title, body=body, url=url, **kwargs)
    return notification





