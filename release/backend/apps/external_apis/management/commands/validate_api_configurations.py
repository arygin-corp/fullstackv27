from django.core.management.base import BaseCommand
from django.core.exceptions import ValidationError
from ...models import APIConfiguration
from ...security import validate_destination
class Command(BaseCommand):
    help="Validate all active upstream API configurations."
    def handle(self,*a,**o):
        failures=0
        for config in APIConfiguration.objects.filter(active=True):
            try: config.full_clean(); validate_destination(config.full_url,config.approved_hosts)
            except Exception as exc: failures+=1; self.stderr.write(f"{config.slug} v{config.version}: {exc}")
        if failures: raise ValidationError(f"{failures} active API configuration(s) failed validation.")
        self.stdout.write(self.style.SUCCESS("All active API configurations are valid."))
