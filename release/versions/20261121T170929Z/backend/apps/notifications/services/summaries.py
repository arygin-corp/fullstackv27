from collections import Counter
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from notifications.models import Notification, NotificationSummary, SummaryFrequency, SummaryStatus
from notifications.monitoring.metrics import inc
from notifications.telemetry import span
from .ai import DeterministicSummaryProvider, get_summary_provider

def summary_period(frequency, now=None):
    now=now or timezone.now()
    days=7 if frequency==SummaryFrequency.WEEKLY else 1
    return now-timedelta(days=days),now

def summary_payload(user,start,end):
    qs=Notification.objects.for_user(user).active().filter(created_at__gte=start,created_at__lt=end)
    records=list(qs.values("notification_type","title","read").order_by("-created_at")[:settings_limit()])
    counts=Counter(r["notification_type"] for r in records)
    return {"input_count":len(records),"unread_count":sum(not r["read"] for r in records),"category_counts":dict(counts),"titles":[{"type":r["notification_type"],"title":r["title"][:200]} for r in records]}

def settings_limit():
    from django.conf import settings
    return settings.AI_SUMMARY_MAX_ITEMS

def generate_summary(user,frequency=SummaryFrequency.ON_DEMAND,start=None,end=None):
    start=start or summary_period(SummaryFrequency.DAILY if frequency==SummaryFrequency.ON_DEMAND else frequency)[0]; end=end or timezone.now()
    summary,created=NotificationSummary.objects.get_or_create(user=user,frequency=frequency,period_start=start,period_end=end)
    if not created and summary.status==SummaryStatus.COMPLETED: return summary
    summary.status=SummaryStatus.PROCESSING; summary.save(update_fields=["status","updated_at"])
    payload=summary_payload(user,start,end); provider=get_summary_provider()
    with span("notification.summary.generate",user_id=user.pk,frequency=frequency,provider=provider.name,input_count=payload["input_count"]):
        try: result=provider.summarize(payload)
        except Exception as exc:
            inc("notification_ai_summary_failures_total",labels={"provider":provider.name})
            if provider.name!="deterministic":
                provider=DeterministicSummaryProvider(); result=provider.summarize(payload); summary.error_code="ai_provider_fallback"; summary.error_summary=str(exc)[:500]
            else:
                summary.status=SummaryStatus.FAILED; summary.error_code=type(exc).__name__; summary.error_summary=str(exc)[:500]; summary.save(); return summary
        summary.status=SummaryStatus.COMPLETED; summary.provider=provider.name; summary.model_name=provider.model_name; summary.input_count=payload["input_count"]; summary.category_counts=payload["category_counts"]; summary.content=result["content"]; summary.key_points=result["key_points"]; summary.action_items=result["action_items"]; summary.generated_at=timezone.now(); summary.save()
        inc("notification_ai_summaries_total",labels={"provider":provider.name,"frequency":frequency}); return summary
