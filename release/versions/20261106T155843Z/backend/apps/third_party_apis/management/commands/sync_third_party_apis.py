from django.core.management.base import BaseCommand

from apps.third_party_apis.sync import sync_installed_modules


class Command(BaseCommand):
    help = "Synchronize all registered master modules, including Data Marketplace."

    def handle(self, *args, **options):
        for row, created in sync_installed_modules():
            state = "Installed" if created else "Exists"
            self.stdout.write(f"{state}: {row.name} [{row.module_key}] enabled={row.enabled}")
