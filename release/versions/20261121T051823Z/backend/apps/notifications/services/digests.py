from datetime import timedelta
from django.utils import timezone
from notifications.models import DigestFrequency, Notification, NotificationDigest, NotificationPreference

def period_for(frequency, now=None):
    now=now or timezone.now(); delta=timedelta(days=1 if frequency==DigestFrequency.DAILY else 7)
    return now-delta, now

def build_digest(user, frequency, now=None):
    start,end=period_for(frequency,now)
    items=list(Notification.objects.for_user(user).active().filter(created_at__gte=start,created_at__lt=end,digest_sent_at__isnull=True).order_by("created_at","id"))
    if not items: return None
    digest,_=NotificationDigest.objects.get_or_create(user=user,frequency=frequency,period_start=start,period_end=end,defaults={"item_count":len(items),"content":"\n".join(f"- [{n.get_notification_type_display()}] {n.title}" for n in items)})
    return digest,items
