from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from knowledge.models import MarketplaceActivity, MarketplaceAnalyticsSnapshot, MarketplaceSearchEvent
class Command(BaseCommand):
    help="Delete analytics events older than the configured retention period."
    def add_arguments(self,p): p.add_argument("--days",type=int,default=settings.MARKETPLACE_ANALYTICS_RETENTION_DAYS)
    def handle(self,*args,**o):
        cutoff=timezone.now()-timedelta(days=max(o["days"],1)); a,_=MarketplaceActivity.objects.filter(created_at__lt=cutoff).delete(); s,_=MarketplaceSearchEvent.objects.filter(created_at__lt=cutoff).delete(); n,_=MarketplaceAnalyticsSnapshot.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {a} activity rows, {s} search rows, and {n} snapshots."))
