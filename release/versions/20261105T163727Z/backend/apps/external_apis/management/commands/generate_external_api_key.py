from django.core.management.base import BaseCommand, CommandError
from ...key_services import generate_api_key
from ...models import FrontendApplication
class Command(BaseCommand):
    help = "Generate a scoped, expiring API key and print the plaintext once."
    def add_arguments(self,p): p.add_argument("application_id",type=int); p.add_argument("--name",default="CLI generated"); p.add_argument("--scope",action="append",default=[]); p.add_argument("--days",type=int,default=90); p.add_argument("--cidr",action="append",default=[])
    def handle(self,*a,**o):
        try: application=FrontendApplication.objects.get(pk=o["application_id"],active=True)
        except FrontendApplication.DoesNotExist as exc: raise CommandError("Active application not found.") from exc
        generated=generate_api_key(application=application,name=o["name"],created_by=None,scopes=o["scope"],lifetime_days=o["days"],allowed_cidrs=o["cidr"]); self.stdout.write(generated.plaintext)
