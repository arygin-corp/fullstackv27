from django.core.management.base import BaseCommand
from notifications.chaos import validate_chaos_request
class Command(BaseCommand):
    help="Validate chaos experiment safety gates without executing an experiment."
    def add_arguments(self,parser):
        parser.add_argument("--environment",required=True); parser.add_argument("--duration-seconds",type=int,required=True); parser.add_argument("--affected-replicas",type=int,default=1)
    def handle(self,*args,**options):
        validate_chaos_request(environment=options["environment"],duration_seconds=options["duration_seconds"],affected_replicas=options["affected_replicas"])
        self.stdout.write("Chaos experiment request passes configured safety gates. No experiment was executed.")
