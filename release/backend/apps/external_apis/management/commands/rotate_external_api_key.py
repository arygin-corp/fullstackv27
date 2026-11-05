from django.core.management.base import BaseCommand, CommandError
from ...key_services import generate_api_key, revoke_api_key
from ...models import APIKey
class Command(BaseCommand):
    help="Create a replacement key. Optionally revoke the old key immediately."
    def add_arguments(self,p): p.add_argument("key_id"); p.add_argument("--days",type=int,default=90); p.add_argument("--revoke-old",action="store_true")
    def handle(self,*a,**o):
        try: old=APIKey.objects.select_related("application").get(pk=o["key_id"])
        except (APIKey.DoesNotExist,ValueError) as exc: raise CommandError("API key not found.") from exc
        new=generate_api_key(application=old.application,name=f"{old.name} rotation",created_by=None,scopes=old.scopes,lifetime_days=o["days"],allowed_cidrs=old.allowed_cidrs,rotated_from=old)
        if o["revoke_old"]: revoke_api_key(old,revoked_by=None,reason="Rotated by management command")
        self.stdout.write(new.plaintext)
