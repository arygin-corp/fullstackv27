from django.core.management.base import BaseCommand
from apps.workflow_engine.bpmn import BPMNService
from apps.workflow_engine.models import WorkflowDefinition


class Command(BaseCommand):
    def add_arguments(self, p):
        p.add_argument("key")
        p.add_argument("--workflow-version", type=int, help="Workflow version to export")

    def handle(self, *args, **o):
        q = WorkflowDefinition.objects.filter(key=o["key"])
        q = (q.filter(version=o["workflow_version"])
         if o.get("workflow_version") is not None
         else q
        )
        self.stdout.write(BPMNService.export(q.order_by("-version").first()))
