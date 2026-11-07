from django.core.management.base import BaseCommand

from apps.third_party_apis.modules.onets_order_history.services import refresh_open_requests


class Command(BaseCommand):
    help = "Refresh open OneTS order-history requests from ServiceNow."

    def handle(self, *args, **options):
        count = refresh_open_requests()
        self.stdout.write(f"Refreshed {count} open order-history request(s).")
