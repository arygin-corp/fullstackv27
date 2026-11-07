from django.core.management.base import BaseCommand,CommandError
from apps.third_party_apis.registry import registry
class Command(BaseCommand):
 def handle(self,*a,**o):
  registry.autodiscover();n=len(registry.all());
  if n!=7:raise CommandError(f"Expected 7 modules, found {n}")
  self.stdout.write(self.style.SUCCESS("All 7 modules registered."))
