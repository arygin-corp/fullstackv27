from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.resources.models import Brand, Document, Homepage, Media, Policie, Processe, ResourceApprovalAudit
from apps.resources.services.core import archive_resource, publish_resource, emit
class Command(BaseCommand):
    help='Publishes and archives scheduled resource content.'
    def handle(self,*args,**options):
        now=timezone.now(); published=archived=0
        for model in (Homepage,Brand,Document,Policie,Processe,Media):
            for obj in model.objects.filter(is_archived=False,is_active=False,publish_at__isnull=False,publish_at__lte=now).iterator():
                publish_resource(obj,event=ResourceApprovalAudit.Event.SCHEDULED_PUBLISH); emit('RESOURCE_SCHEDULED_PUBLISH',resource=obj); published+=1
            for obj in model.objects.filter(is_archived=False,expire_at__isnull=False,expire_at__lte=now).iterator(): archive_resource(obj,scheduled=True); archived+=1
        self.stdout.write(self.style.SUCCESS(f'published={published} archived={archived}'))
