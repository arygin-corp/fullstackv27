from django.core.management.base import BaseCommand
from django.utils import timezone
from ...models import IdempotencyRecord
class Command(BaseCommand):
    help="Delete expired idempotency records."
    def handle(self,*a,**o):
        count,_=IdempotencyRecord.objects.filter(expires_at__lte=timezone.now()).delete(); self.stdout.write(f"Deleted {count} expired record(s).")
