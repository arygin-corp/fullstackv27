import json
from django.core.management.base import BaseCommand, CommandError
from notifications.services.eventsourcing import notification_state_from_events, replay_projection
class Command(BaseCommand):
    help="Replay notification events without resending deliveries."
    def add_arguments(self,parser):
        parser.add_argument("--notification-id"); parser.add_argument("--checkpoint",default="notification_state"); parser.add_argument("--limit",type=int)
    def handle(self,*args,**options):
        if options["notification_id"]:
            self.stdout.write(json.dumps(notification_state_from_events(options["notification_id"]),indent=2,default=str)); return
        count=replay_projection(options["checkpoint"],options["limit"]); self.stdout.write(f"Processed {count} event(s); deliveries were not replayed.")
