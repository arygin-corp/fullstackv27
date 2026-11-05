from celery import shared_task
from django.utils import timezone
from .models import ScheduledPublication
from .services import publish
@shared_task
def process_scheduled_publications():
    for item in ScheduledPublication.objects.filter(status="pending",execute_at__lte=timezone.now()).select_related("page","version","requested_by"):
        try:
            if item.action=="publish":publish(item.version,item.requested_by)
            else:item.page.published_version=None;item.page.save(update_fields=("published_version",))
            item.status="completed"
        except Exception as exc:item.status="failed";item.error=str(exc)
        item.save()
