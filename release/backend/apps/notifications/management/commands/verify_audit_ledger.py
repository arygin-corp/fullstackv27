from django.core.management.base import BaseCommand
from notifications.ledger import create_checkpoint, verify_ledger
class Command(BaseCommand):
    help="Verify the tamper-evident audit ledger hash chain."
    def handle(self,*args,**options):
        result=verify_ledger(); self.stdout.write(f"status={result.status} checked={result.checked_entries} invalid_sequence={result.first_invalid_sequence}")
        if result.status!="passed": raise SystemExit(2)
        checkpoint=create_checkpoint()
        if checkpoint: self.stdout.write(f"checkpoint_sequence={checkpoint.sequence}")
