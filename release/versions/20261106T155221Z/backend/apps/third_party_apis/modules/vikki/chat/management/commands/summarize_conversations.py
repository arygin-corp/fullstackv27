from django.core.management.base import BaseCommand, CommandError
from apps.third_party_apis.modules.vikki.chat.memory import summarize_conversation
from apps.third_party_apis.modules.vikki.chat.models import Conversation
class Command(BaseCommand):
    help="Refresh long-conversation summaries."
    def add_arguments(self,parser):
        parser.add_argument("--user"); parser.add_argument("--conversation-id",type=int); parser.add_argument("--force",action="store_true")
    def handle(self,*args,**options):
        qs=Conversation.objects.select_related("user")
        if options.get("user"): qs=qs.filter(user__username=options["user"])
        if options.get("conversation_id"): qs=qs.filter(pk=options["conversation_id"])
        count=0
        for conversation in qs:
            try: summarize_conversation(conversation,force=options["force"])
            except Exception as exc: raise CommandError(f"Failed for conversation {conversation.id}: {exc}") from exc
            count+=1
        self.stdout.write(self.style.SUCCESS(f"Processed {count} conversation(s)."))
