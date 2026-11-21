from datetime import timedelta
from django.conf import settings
from django.db.models import Count, Q
from django.utils import timezone
from apps.notifications.models import AuditLedgerVerification, DeadLetterStatus, DeliveryStatus, Notification, NotificationDeadLetter, NotificationDelivery, NotificationMetric, NotificationOutbox, OutboxStatus

def _sum(name, since):
    return sum(NotificationMetric.objects.filter(name=name, recorded_at__gte=since).values_list("value", flat=True))

def evaluate_alerts():
    now = timezone.now(); since = now - timedelta(minutes=settings.MONITORING_WINDOW_MINUTES)
    deliveries = NotificationDelivery.objects.filter(updated_at__gte=since)
    total = deliveries.count(); failed = deliveries.filter(status=DeliveryStatus.FAILED).count()
    old_pending = NotificationDelivery.objects.filter(status__in=[DeliveryStatus.PENDING, DeliveryStatus.PROCESSING], created_at__lte=now-timedelta(seconds=settings.ALERT_UNPUBLISHED_AGE_SECONDS)).count()
    metrics = {
        "creation_failures": _sum("notification_creation_failures_total", since),
        "redis_failures": _sum("notification_redis_connection_failures_total", since),
        "task_retries": _sum("notification_task_retries_total", since),
        "active_sse": _sum("notification_sse_active_connections", since),
        "slow_db_queries": _sum("notification_db_slow_queries_total", since),
        "delivery_failure_rate": (failed / total) if total else 0.0,
        "unpublished_notifications": old_pending,
        "outbox_backlog": NotificationOutbox.objects.filter(status__in=[OutboxStatus.PENDING, OutboxStatus.FAILED]).count(),
        "dead_letters_open": NotificationDeadLetter.objects.filter(status=DeadLetterStatus.OPEN).count(),
        "ledger_verification_failed": int(AuditLedgerVerification.objects.filter(status="failed").exists()),
    }
    try:
        import redis
        metrics["celery_queue_depth"] = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1).llen("celery")
    except Exception:
        metrics["celery_queue_depth"] = -1
    alerts = []
    def add(key, condition, severity, summary):
        if condition: alerts.append({"alert": key, "severity": severity, "summary": summary, "value": metrics.get(key)})
    add("creation_failures", metrics["creation_failures"] >= settings.ALERT_CREATION_FAILURES, "critical", "Sustained notification-creation failures")
    add("redis_failures", metrics["redis_failures"] >= settings.ALERT_REDIS_FAILURES, "critical", "Redis connection failures")
    add("celery_queue_depth", metrics["celery_queue_depth"] >= settings.ALERT_CELERY_QUEUE_DEPTH, "warning", "Celery queue growth")
    add("task_retries", metrics["task_retries"] >= settings.ALERT_TASK_RETRIES, "warning", "Repeated task retries")
    add("delivery_failure_rate", metrics["delivery_failure_rate"] >= settings.ALERT_DELIVERY_FAILURE_RATE and total >= 5, "critical", "Delivery failure-rate increase")
    add("active_sse", metrics["active_sse"] >= settings.ALERT_SSE_CONNECTIONS, "warning", "SSE connection count exceeds configured infrastructure limit")
    add("slow_db_queries", metrics["slow_db_queries"] > 0, "warning", "Database query latency increase")
    add("unpublished_notifications", metrics["unpublished_notifications"] > 0, "critical", "No notification events published despite recorded notification creation")
    add("outbox_backlog", metrics["outbox_backlog"] >= settings.ALERT_OUTBOX_BACKLOG, "warning", "Notification outbox backlog exceeds threshold")
    add("dead_letters_open", metrics["dead_letters_open"] >= settings.ALERT_DEAD_LETTERS_OPEN, "critical", "Open notification dead letters require attention")
    add("ledger_verification_failed", metrics["ledger_verification_failed"] > 0, "critical", "Audit ledger verification failed")
    return {"window_minutes": settings.MONITORING_WINDOW_MINUTES, "metrics": metrics, "alerts": alerts}
