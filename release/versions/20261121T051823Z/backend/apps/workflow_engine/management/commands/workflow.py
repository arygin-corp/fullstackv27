import json
from django.core.management.base import BaseCommand, CommandError
from apps.workflow_engine.models import WorkflowDefinition
from apps.workflow_engine.workflows.services import WorkflowValidator, ExportService
from apps.workflow_engine.genome.services import GenomeService
from apps.workflow_engine.health.services import HealthService


class Command(BaseCommand):
    help = "Master workflow CLI: validate, export, genome, health"

    def add_arguments(self, p):
        p.add_argument("operation", choices=("validate", "export", "genome", "health"))
        p.add_argument("key")
        p.add_argument("--version", type=int)

    def handle(self, *args, **o):
        q = WorkflowDefinition.objects.filter(key=o["key"])
        q = q.filter(version=o["version"]) if o["version"] else q
        w = q.order_by("-version").first()
        if not w:
            raise CommandError("Workflow not found")
        result = {
            "validate": lambda: {"errors": WorkflowValidator.validate(w)},
            "export": lambda: ExportService.export(w),
            "genome": lambda: {"genome_id": GenomeService.calculate(w).pk},
            "health": lambda: {"health_id": HealthService.calculate(w).pk},
        }[o["operation"]]()
        self.stdout.write(json.dumps(result, default=str))
