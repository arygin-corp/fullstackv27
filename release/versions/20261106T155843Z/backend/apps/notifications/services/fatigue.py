import hashlib
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from apps.notifications.models import DeliveryChannel, FatigueDecision, Notification, NotificationBundle, NotificationFatigueAssessment, NotificationType, PriorityLevel
from apps.notifications.monitoring.metrics import inc
from apps.notifications.services.eventsourcing import append_event

def fingerprint(notification):
    raw=f"{notification.recipient_id}|{notification.notification_type}|{notification.source}|{notification.title.strip().lower()}"
    return hashlib.sha256(raw.encode()).hexdigest()

def assess_fatigue(notification,channels):
    if not settings.FATIGUE_DETECTION_ENABLED:
        fp=fingerprint(notification)
        assessment,_=NotificationFatigueAssessment.objects.update_or_create(notification=notification,defaults={"decision":FatigueDecision.DELIVER,"reason_codes":["fatigue_disabled"],"fingerprint":fp})
        return assessment,set(channels)
    now=timezone.now(); fp=fingerprint(notification)
    recent=Notification.objects.filter(recipient=notification.recipient,is_deleted=False).exclude(pk=notification.pk)
    hour=recent.filter(created_at__gte=now-timedelta(hours=1)).count()
    day=recent.filter(created_at__gte=now-timedelta(days=1)).count()
    unread=recent.filter(read=False).count()
    duplicates=recent.filter(created_at__gte=now-timedelta(hours=settings.FATIGUE_DUPLICATE_WINDOW_HOURS),notification_type=notification.notification_type,source=notification.source,title__iexact=notification.title).count()
    priority=getattr(getattr(notification,"priority_assessment",None),"final_priority",PriorityLevel.MEDIUM)
    mandatory=notification.notification_type==NotificationType.SECURITY or priority==PriorityLevel.CRITICAL
    reasons=[]; decision=FatigueDecision.DELIVER; final=set(channels)
    if mandatory: decision=FatigueDecision.BYPASS; reasons=["mandatory_or_critical"]
    elif duplicates>=settings.FATIGUE_DUPLICATE_THRESHOLD:
        decision=FatigueDecision.SUPPRESS_DUPLICATE; reasons=["duplicate_threshold"]; final=set()
    elif hour>=settings.FATIGUE_HOURLY_THRESHOLD or day>=settings.FATIGUE_DAILY_THRESHOLD:
        decision=FatigueDecision.DIGEST; reasons=["volume_threshold"]
        final={DeliveryChannel.DIGEST} if DeliveryChannel.DIGEST in channels else {DeliveryChannel.IN_APP}
    elif len(final)>1 and unread>=settings.FATIGUE_UNREAD_THRESHOLD:
        decision=FatigueDecision.REDUCE_CHANNELS; reasons=["unread_accumulation"]
        final={DeliveryChannel.IN_APP} if DeliveryChannel.IN_APP in final else {next(iter(final))}
    assessment,_=NotificationFatigueAssessment.objects.update_or_create(notification=notification,defaults={"decision":decision,"reason_codes":reasons or ["normal_volume"],"recent_hour_count":hour,"recent_day_count":day,"unread_count":unread,"duplicate_count":duplicates,"fingerprint":fp})
    if decision in {FatigueDecision.DIGEST,FatigueDecision.SUPPRESS_DUPLICATE,FatigueDecision.REDUCE_CHANNELS}:
        bundle,_=NotificationBundle.objects.get_or_create(user=notification.recipient,fingerprint=fp,status="open",defaults={"title":notification.title})
        bundle.notifications.add(notification); bundle.item_count=bundle.notifications.count(); bundle.save(update_fields=["item_count","updated_at"])
    append_event(aggregate_type="Notification",aggregate_id=notification.pk,event_type="notification.fatigue.assessed",correlation_id=notification.correlation_id,tenant=notification.tenant,application=notification.application,payload={"decision":decision,"reason_codes":assessment.reason_codes,"duplicate_count":duplicates})
    inc("notification_fatigue_decisions_total",labels={"decision":decision})
    return assessment,final
