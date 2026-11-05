from django.core.management.base import BaseCommand
from django.db import transaction

from apps.workflow_engine.models import WorkflowDefinition, WorkflowState, WorkflowTransition


class Command(BaseCommand):
    help = "Create a sample approval workflow"

    @transaction.atomic
    def handle(self, *args, **options):
        workflow, _ = WorkflowDefinition.objects.get_or_create(name="Approval", key="approval", version=1)
        draft, _ = WorkflowState.objects.get_or_create(workflow=workflow, key="draft", defaults={"name": "Draft", "is_initial": True})
        review, _ = WorkflowState.objects.get_or_create(workflow=workflow, key="review", defaults={"name": "In Review"})
        approved, _ = WorkflowState.objects.get_or_create(workflow=workflow, key="approved", defaults={"name": "Approved", "is_terminal": True})
        WorkflowTransition.objects.get_or_create(workflow=workflow, key="submit", defaults={"name": "Submit", "source": draft, "target": review})
        WorkflowTransition.objects.get_or_create(workflow=workflow, key="approve", defaults={"name": "Approve", "source": review, "target": approved})
        WorkflowTransition.objects.get_or_create(workflow=workflow, key="reject", defaults={"name": "Reject", "source": review, "target": draft})
        self.stdout.write(self.style.SUCCESS("Sample approval workflow created."))
