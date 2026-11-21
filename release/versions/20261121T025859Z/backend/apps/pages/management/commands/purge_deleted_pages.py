from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.pages.models import Page
class Command(BaseCommand):
    def add_arguments(self,p):p.add_argument("--dry-run",action="store_true")
    def handle(self,*args,**opts):
        q=Page.objects.filter(is_deleted=True,purge_at__lte=timezone.now());self.stdout.write(f"Eligible: {q.count()}")
        if not opts["dry_run"]:q.delete()
