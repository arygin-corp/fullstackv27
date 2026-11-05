from django.core.management.base import BaseCommand, CommandError
from ...key_services import revoke_api_key
from ...models import APIKey
class Command(BaseCommand):
    help="Revoke an API key immediately."
    def add_arguments(self,p): p.add_argument("key_id"); p.add_argument("--reason",required=True)
    def handle(self,*a,**o):
        try: key=APIKey.objects.get(pk=o["key_id"])
        except (APIKey.DoesNotExist,ValueError) as exc: raise CommandError("API key not found.") from exc
        revoke_api_key(key,revoked_by=None,reason=o["reason"]); self.stdout.write(self.style.SUCCESS("API key revoked."))
