import json
import logging
from django.conf import settings
logger = logging.getLogger(__name__)

def channel_for_user(user_id):
    return f"{settings.NOTIFICATION_EVENT_PREFIX}:{user_id}"

def notification_event(notification):
    return {"schema_version": 1, "event_id": str(notification.correlation_id), "event_type": "notification.created", "notification_id": notification.pk, "recipient_id": notification.recipient_id, "correlation_id": str(notification.correlation_id), "occurred_at": notification.created_at.isoformat()}

def publish_notification(notification):
    if not settings.NOTIFICATIONS_REDIS_EVENTS_ENABLED:
        return False
    try:
        import redis
        client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=2, socket_timeout=2, decode_responses=True)
        client.publish(channel_for_user(notification.recipient_id), json.dumps(notification_event(notification)))
        return True
    except Exception:
        from notifications.monitoring.metrics import inc
        inc("notification_redis_connection_failures_total")
        logger.exception("notification_event_publish_failed", extra={"notification_id": notification.pk, "recipient_id": notification.recipient_id, "correlation_id": str(notification.correlation_id)})
        return False
