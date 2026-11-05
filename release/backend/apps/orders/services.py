import json
import os
import tempfile
import uuid
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .models import MarketplaceOrder, Request, ServiceNowSyncAudit, Task


def _datetime(value):
    if value in (None, ""):
        return None
    if hasattr(value, "tzinfo"):
        return value
    parsed = parse_datetime(str(value))
    if parsed is None:
        raise ValueError(f"Invalid datetime value: {value}")
    return timezone.make_aware(parsed, timezone.get_current_timezone()) if timezone.is_naive(parsed) else parsed


def request_defaults(payload):
    return {
        "number": str(payload.get("requestNum") or payload.get("number") or "").strip(),
        "ritm_id": str(payload.get("ritmID") or payload.get("ritm_id") or "").strip(),
        "ritm_number": str(payload.get("ritm") or payload.get("ritm_number") or "").strip(),
        "object_id": str(payload.get("objectId") or payload.get("object_id") or "").strip(),
        "product_id": str(payload.get("product_id") or "").strip(),
        "approval_stage": str(payload.get("approvalStage") or payload.get("approval_stage") or "").strip(),
        "ritm_state": str(payload.get("ritmState") or payload.get("ritm_state") or payload.get("state") or "").strip(),
        "stage": str(payload.get("stage") or "").strip(),
        "opened_at": _datetime(payload.get("openedAt") or payload.get("opened_at")),
        "closed_at": _datetime(payload.get("closedAt") or payload.get("closed_at")),
        "requested_for": str(payload.get("requested_for") or "").strip(),
        "opened_by": str(payload.get("opened_by") or "").strip(),
        "ritm_assigned_to": str(payload.get("assigned_to") or payload.get("ritm_assigned_to") or "").strip(),
        "ritm_comments": payload.get("comments") or payload.get("ritm_comments") or [],
        "ritm_approvers": payload.get("approvers") or payload.get("ritm_approvers") or [],
        "variables": payload.get("variables") or {},
        "form_data": payload.get("form_data"),
        "source_updated_at": _datetime(payload.get("updatedAt") or payload.get("updated_at") or payload.get("sys_updated_on")),
    }


def task_defaults(payload):
    return {
        "task_id": str(payload.get("taskID") or payload.get("task_id") or payload.get("sys_id") or "").strip(),
        "number": str(payload.get("taskNumber") or payload.get("number") or "").strip(),
        "ritm": str(payload.get("ritm") or payload.get("ritm_number") or "").strip(),
        "created": _datetime(payload.get("created")),
        "state": str(payload.get("state") or "").strip(),
        "due": _datetime(payload.get("due")),
        "assignment_group": str(payload.get("assignmentGroup") or payload.get("assignment_group") or "").strip(),
        "assignment_group_manager": str(payload.get("assignmentGroupManager") or payload.get("assignment_group_manager") or "").strip(),
        "assigned_to": str(payload.get("assignedTo") or payload.get("assigned_to") or "").strip(),
        "source_updated_at": _datetime(payload.get("updatedAt") or payload.get("updated_at") or payload.get("sys_updated_on")),
    }


def _changed(instance, values):
    return [name for name, value in values.items() if getattr(instance, name) != value]


def _audit(order, correlation_id, run_id, entity, operation, status, values, task_number=""):
    ServiceNowSyncAudit.objects.create(
        marketplace_order=order,
        correlation_id=correlation_id,
        sync_run_id=run_id,
        entity_type=entity,
        operation=operation,
        status=status,
        servicenow_ritm_id=values.get("ritm_id", ""),
        request_number=values.get("number", "") if entity == "REQUEST" else "",
        ritm_number=values.get("ritm_number", ""),
        task_number=task_number,
        changed_fields=values.get("changed_fields", []),
        started_at=timezone.now(),
        completed_at=timezone.now(),
        duration_ms=0,
    )


@transaction.atomic
def synchronize_marketplace_order(payload, correlation_id=None, sync_run_id="", schedule_export=True):
    correlation_id = correlation_id or str(uuid.uuid4())
    marketplace_order_id = str(payload.get("marketplace_order_id") or "").strip()
    if not marketplace_order_id:
        raise ValueError("marketplace_order_id is required")

    order, _ = MarketplaceOrder.objects.select_for_update().get_or_create(
        marketplace_order_id=marketplace_order_id
    )
    metrics = {"requests_created": 0, "requests_updated": 0, "requests_unchanged": 0, "tasks_created": 0, "tasks_updated": 0, "tasks_unchanged": 0}

    for request_payload in payload.get("requests") or []:
        values = request_defaults(request_payload)
        if not values["ritm_id"]:
            raise ValueError("ritmID is required")
        record = Request.objects.select_for_update().filter(marketplace_order=order, ritm_id=values["ritm_id"]).first()
        if record is None:
            record = Request.objects.create(marketplace_order=order, **values)
            operation, changed = "created", list(values)
        else:
            changed = [] if record.source_updated_at and values["source_updated_at"] and values["source_updated_at"] < record.source_updated_at else _changed(record, values)
            if changed:
                for field in changed:
                    setattr(record, field, values[field])
                record.save(update_fields=changed + ["updated_at"])
                operation = "updated"
            else:
                operation = "unchanged"
        metrics[f"requests_{operation}"] += 1
        _audit(order, correlation_id, sync_run_id, "REQUEST", operation.upper(), "UNCHANGED" if operation == "unchanged" else "SUCCEEDED", {**values, "changed_fields": changed})

        for task_payload in request_payload.get("tasks") or []:
            task_values = task_defaults(task_payload)
            if not task_values["number"]:
                raise ValueError("Task number is required")
            task = Task.objects.select_for_update().filter(request=record, number=task_values["number"]).first()
            if task is None:
                task = Task.objects.create(request=record, **task_values)
                task_operation, task_changed = "created", list(task_values)
            else:
                task_changed = [] if task.source_updated_at and task_values["source_updated_at"] and task_values["source_updated_at"] < task.source_updated_at else _changed(task, task_values)
                if task_changed:
                    for field in task_changed:
                        setattr(task, field, task_values[field])
                    task.save(update_fields=task_changed + ["updated_at"])
                    task_operation = "updated"
                else:
                    task_operation = "unchanged"
            metrics[f"tasks_{task_operation}"] += 1
            _audit(order, correlation_id, sync_run_id, "TASK", task_operation.upper(), "UNCHANGED" if task_operation == "unchanged" else "SUCCEEDED", {"ritm_id": record.ritm_id, "ritm_number": record.ritm_number, "changed_fields": task_changed}, task.number)

    order.sync_status = MarketplaceOrder.SyncStatus.SYNCHRONIZED
    order.last_synced_at = timezone.now()
    order.save(update_fields=("sync_status", "last_synced_at", "updated_at"))
    if schedule_export:
        transaction.on_commit(lambda: export_orders_json(correlation_id, sync_run_id))
    return order, metrics


def normalize_servicenow_payload(raw, marketplace_order_id=None):
    body = raw.get("result", raw) if isinstance(raw, dict) else raw
    if isinstance(body, list):
        return {"marketplace_order_id": marketplace_order_id, "requests": body}
    requests = body.get("requests") or body.get("items") or ([body] if body.get("ritmID") or body.get("ritm_id") else [])
    return {"marketplace_order_id": marketplace_order_id or body.get("marketplace_order_id"), "requests": requests}


def export_orders_json(correlation_id=None, sync_run_id=""):
    path = Path(getattr(settings, "ORDERS_EXPORT_PATH", Path(settings.BASE_DIR) / "static/json/marketplace/orders/orders.json"))
    path.parent.mkdir(parents=True, exist_ok=True)
    data = []
    for order in MarketplaceOrder.objects.prefetch_related("requests__tasks"):
        data.append({
            "marketplace_order_id": order.marketplace_order_id,
            "requests": [{
                "request_number": req.number,
                "ritm_id": req.ritm_id,
                "ritm_number": req.ritm_number,
                "object_id": req.object_id,
                "product_id": req.product_id,
                "approval_stage": req.approval_stage,
                "ritm_state": req.ritm_state,
                "stage": req.stage,
                "opened_at": req.opened_at.isoformat() if req.opened_at else None,
                "tasks": [{
                    "task_number": task.number,
                    "state": task.state,
                    "assignment_group": task.assignment_group,
                    "assignment_group_manager": task.assignment_group_manager,
                    "assigned_to": task.assigned_to,
                    "created": task.created.isoformat() if task.created else None,
                    "due": task.due.isoformat() if task.due else None,
                } for task in req.tasks.all()],
            } for req in order.requests.all()],
        })
    fd, temp_name = tempfile.mkstemp(prefix="orders-", suffix=".json", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    except Exception:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
        raise
    return path
