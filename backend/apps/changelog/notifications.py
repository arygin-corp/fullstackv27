import logging

from django.conf import settings
from django.core.mail import send_mass_mail

from .models import Notification, Post, ReleaseSubscription

logger = logging.getLogger(__name__)


def notify_release_published(post_id):
    """Create deduplicated in-app notifications and send opted-in email."""
    post = Post.objects.get(pk=post_id)
    subscriptions = ReleaseSubscription.objects.select_related("user").filter(
        user__is_active=True
    )
    title = f"Changelog {post.version} published"
    message = f"{post.title}: {post.desc}"

    in_app = [
        Notification(user=sub.user, post=post, title=title, message=message)
        for sub in subscriptions
        if sub.in_app_enabled
    ]
    Notification.objects.bulk_create(in_app, ignore_conflicts=True)
    from apps.notifications.services.ingress import publish
    from apps.notifications.models import NotificationType

    for item in Notification.objects.filter(post=post):
        publish(
            recipient=item.user,
            title=item.title,
            body=item.message,
            url="/changelog/notifications/",
            notification_type=NotificationType.SYSTEM,
            source="changelog",
            source_object_type="Post",
            source_object_id=item.post_id,
            idempotency_key=f"changelog-notification:{item.pk}",
        )

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)
    emails = [
        (title, message, from_email, [sub.user.email])
        for sub in subscriptions
        if sub.email_enabled and sub.user.email
    ]
    if emails:
        try:
            send_mass_mail(emails, fail_silently=False)
        except Exception:
            logger.exception("Release %s email notifications failed", post.pk)
