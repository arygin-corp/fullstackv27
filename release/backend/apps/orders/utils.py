import json
import os
from django.conf import settings
from apps.orders.models import Request, Task

def get_base_url():
    return getattr(settings, 'BACKEND_URL', 'http://localhost:8000').rstrip('/')

def export_master_orders_json():
    """Generates orders.json by joining Request and Task tables."""
    # Fetch all requests and prefetch their related tasks for efficiency
    queryset = Request.objects.prefetch_related('task_set').all().order_by('-id')

    order_data = []

    for req in queryset:
        # Build the Request dictionary
        req_entry = {
            "id": req.id,
            "request_number": req.number,
            "request_id_alt": req.requestID,
            "opened_at": req.opened_at.isoformat() if req.opened_at else None,
            "closed_at": req.closed_at.isoformat() if req.closed_at else None,
            "opened_by": req.opened_by,
            "requested_for": req.requested_for,
            "submitted_by_name": req.submittedByName,
            "submitted_by_email": req.submittedByEmail,
            "ritm_state": req.ritm_state,
            "ritm_assigned_to": req.ritm_assigned_to,
            "stage": req.stage,
            "approval_stage": req.approval_stage,
            "product_id": req.product_id,
            "variables": req.variables,
            # Nested Tasks
            "tasks": [
                {
                    "task_id": t.id,
                    "task_number": t.number,
                    "ritm": t.ritm,
                    "state": t.state,
                    "assignment_group": t.assignment_group,
                    "assignment_group_manager": t.assignment_group_manager,
                    "created": t.created.isoformat() if t.created else None,
                    "due": t.due.isoformat() if t.due else None,
                } for t in req.task_set.all()
            ]
        }
        order_data.append(req_entry)

    # File path setup
    file_path = os.path.join(settings.BASE_DIR, 'assets/json/marketplace/orders/orders.json')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(order_data, f, indent=4, default=str)

    return file_path