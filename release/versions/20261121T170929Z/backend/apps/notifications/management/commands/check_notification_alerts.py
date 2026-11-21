import json
from django.core.management.base import BaseCommand
from notifications.monitoring.alerts import evaluate_alerts
class Command(BaseCommand):
    help = "Evaluate notification monitoring alerts and exit nonzero when alerts fire."
    def handle(self, *args, **options):
        report = evaluate_alerts(); self.stdout.write(json.dumps(report, indent=2, default=str))
        if report["alerts"]: raise SystemExit(2)
