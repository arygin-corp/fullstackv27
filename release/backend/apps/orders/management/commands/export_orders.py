import json
import os
import decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db.models import Manager
from django.db.models.query import QuerySet
# FIX: Use absolute import for the models
from apps.orders.models import Request, Task

class DjangoOrderEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        if isinstance(obj, (QuerySet, Manager)):
            return []
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

class Command(BaseCommand):
    help = 'Export master orders by joining Request and Task tables'

    def handle(self, *args, **options):
        self.stdout.write("Fetching Requests and related Tasks...")

        # prefetch_related('task_set') joins the tables efficiently
        requests = Request.objects.all().prefetch_related('task_set').order_by('-id')

        master_orders = []

        for req in requests:
            order = {
                "request_info": {
                    "id": req.id,
                    "request_id": getattr(req, 'requestID', None),
                    "object_id": req.object_id,
                    "number": req.number,
                    "status": req.ritm_state,
                    "submitted_by": req.submittedByName,
                    "opened_at": req.opened_at,
                    "assigned_to": req.ritm_assigned_to,
                    "variables": req.variables,
                },
                "tasks": [
                    {
                        "task_number": task.number,
                        "ritm": task.ritm,
                        "state": task.state,
                        "assignment_group": task.assignment_group,
                        "created": task.created,
                    } for task in req.task_set.all()
                ]
            }
            master_orders.append(order)

        output_path = os.path.join(settings.BASE_DIR, 'static/json/marketplace/orders/master_orders.json')
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(master_orders, f, indent=4, cls=DjangoOrderEncoder)

        self.stdout.write(self.style.SUCCESS(f"Successfully exported orders to {output_path}"))