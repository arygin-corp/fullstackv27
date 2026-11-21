from datetime import date
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from knowledge.analytics import dashboard, rebuild_daily_metrics
class Command(BaseCommand):
    help="Rebuild Data Marketplace daily metrics and optionally persist an analytics snapshot."
    def add_arguments(self,p):
        p.add_argument("--user",required=True); p.add_argument("--start"); p.add_argument("--end"); p.add_argument("--snapshot",action="store_true")
    def handle(self,*args,**o):
        try:user=get_user_model().objects.get(username=o["user"])
        except get_user_model().DoesNotExist as exc:raise CommandError("User not found") from exc
        start=date.fromisoformat(o["start"]) if o.get("start") else None; end=date.fromisoformat(o["end"]) if o.get("end") else None
        count=rebuild_daily_metrics(user,start,end); payload=dashboard(user,persist=o["snapshot"])
        self.stdout.write(self.style.SUCCESS(f"Rebuilt {count} daily metric rows. Current period contains {payload['kpis']['searches']} searches."))
