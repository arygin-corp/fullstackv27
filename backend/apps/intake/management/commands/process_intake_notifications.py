from django.core.management.base import BaseCommand
from apps.intake.tasks import process_notification_outbox

class Command(BaseCommand):
    help="Process pending Intake notification emails."
    def add_arguments(self,parser): parser.add_argument("--limit",type=int,default=50)
    def handle(self,*args,**options): self.stdout.write(str(process_notification_outbox(options["limit"])))
