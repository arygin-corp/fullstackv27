import os
from datetime import datetime, timedelta
from urllib.parse import quote

import requests
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .models import OrderHistoryRequest, OrderHistoryTask

DUE_DAY_OFFSET = 2
OPEN_REQUEST_FLOOR = datetime(2001, 7, 5, 5, 1, 27)
CREATE_OPENED_AT = datetime(2022, 6, 22, 0, 0, tzinfo=timezone.get_fixed_timezone(-240))
HOLIDAYS = {
    "1/1/2024",
    "1/15/2024",
    "5/27/2024",
    "7/4/2024",
    "9/2/2024",
    "11/28/2024",
    "11/29/2024",
    "12/24/2024",
    "12/25/2024",
    "12/26/2024",
    "12/27/2024",
    "12/28/2024",
    "12/29/2024",
    "12/30/2024",
    "12/31/2024",
}
REQUEST_UPDATE_SKIP = {"objectId", "productId", "productIdentifier", "createdAt", "id"}
TASK_UPDATE_SKIP = {"createdAt", "number"}


class ServiceNowError(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def snow_configured():
    return all(os.getenv(name) for name in ("ONETS_USERNAME", "ONETS_PASSWORD", "SNOW_API_URL", "SNOW_REQUEST_ENDPOINT", "SNOW_DAR_ENDPOINT"))


def to_camel_case(value, prefix=""):
    if isinstance(value, list):
        return [to_camel_case(item, prefix) if isinstance(item, (dict, list)) else item for item in value]
    converted = {}
    for original_key, item in value.items():
        if not item:
            continue
        key = original_key[len(prefix):] if original_key.startswith(prefix) else original_key
        key = key[:1].lower() + key[1:]
        parts = key.split("_")
        key = parts[0] + "".join(part[:1].upper() + part[1:] for part in parts[1:])
        if isinstance(item, (dict, list)):
            item = to_camel_case(item, prefix)
        converted[key] = item
    return converted


def build_request_search(query):
    parameters = ""
    if query.get("requestedFor"):
        parameters += "&request.requested_for.u_ad_object_id=" + str(query["requestedFor"])
    if query.get("catalogItem"):
        parameters += "&cat_item=" + str(query["catalogItem"])
    return parameters


def call_api(url, headers=None):
    username = os.getenv("ONETS_USERNAME")
    password = os.getenv("ONETS_PASSWORD")
    if not username or not password:
        raise ServiceNowError("ONETS_USERNAME or ONETS_PASSWORD is not set", status_code=500)
    request_headers = dict(headers or {})
    response = requests.get(url, headers=request_headers, auth=(username, password), timeout=30)
    if not response.ok:
        raise ServiceNowError("Error calling ServiceNow", status_code=response.status_code)
    return response.json()


def find_requests(query):
    endpoint = os.getenv("SNOW_API_URL", "").rstrip("/") + "/" + os.getenv("SNOW_REQUEST_ENDPOINT", "").lstrip("/")
    parameters = "?sysparm_fields=request"
    parameters += "&sysparm_limit=" + str(query.get("limit") or "5")
    parameters += "&sysparm_display_value=true"
    parameters += "&sysparm_exclude_reference_link=true"
    parameters += build_request_search(query)
    return call_api(endpoint + quote(parameters, safe="?&=+"))


def get_request_details(query):
    endpoint = os.getenv("SNOW_API_URL", "").rstrip("/") + "/" + os.getenv("SNOW_DAR_ENDPOINT", "").lstrip("/")
    headers = {}
    request_id = query.get("requestId")
    if request_id:
        headers["Request"] = ",".join(request_id) if isinstance(request_id, list) else str(request_id)
    details = call_api(endpoint, headers).get("result") or {}
    for key, request in details.items():
        request["id"] = key
    response = []
    for request in details.values():
        updated = to_camel_case(request, "task_")
        updated["taskData"] = updated.get("data")
        updated.pop("data", None)
        for task in updated.get("taskData") or []:
            task["requestId"] = request["id"]
        response.append(updated)
    return response


def find_and_save_requests(query):
    found = find_requests(query)
    rows = (found or {}).get("result") or []
    if not rows:
        return []
    return get_request_details({"requestId": [row["request"] for row in rows if row.get("request")]})


def _parse_when(value):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value if timezone.is_aware(value) else timezone.make_aware(value, timezone.get_current_timezone())
    parsed = parse_datetime(str(value).replace(" ", "T", 1))
    if parsed is None:
        return None
    return parsed if timezone.is_aware(parsed) else timezone.make_aware(parsed, timezone.get_current_timezone())


def _assign(instance, payload, mapping, skip):
    for source, target in mapping.items():
        if source not in payload or source in skip:
            continue
        value = payload[source]
        if target in {"opened_at", "created", "due"}:
            value = _parse_when(value)
            if value is None:
                continue
        elif target not in {"ritm_comments", "ritm_approvers", "variables", "form_data"} and not isinstance(value, str):
            value = str(value)
        setattr(instance, target, value)


REQUEST_FIELDS = {
    "objectId": "object_id",
    "number": "number",
    "closedAt": "closed_at",
    "ritmState": "ritm_state",
    "requestedFor": "requested_for",
    "openedBy": "opened_by",
    "openedAt": "opened_at",
    "ritmAssignedTo": "ritm_assigned_to",
    "approvalStage": "approval_stage",
    "stage": "stage",
    "ritmComments": "ritm_comments",
    "ritmApprovers": "ritm_approvers",
    "variables": "variables",
    "formData": "form_data",
    "productId": "product_id",
    "productIdentifier": "product_identifier",
}
TASK_FIELDS = {
    "ritm": "ritm",
    "created": "created",
    "state": "state",
    "due": "due",
    "assignmentGroup": "assignment_group",
    "assignmentGroupManager": "assignment_group_manager",
    "assignedTo": "assigned_to",
}


def store_requests(rows, update_existing):
    stored = []
    for row in rows:
        request_id = str(row.get("id") or "")
        if not request_id:
            continue
        current = OrderHistoryRequest.objects.filter(pk=request_id).first()
        if current is None:
            current = OrderHistoryRequest(id=request_id)
            _assign(current, row, REQUEST_FIELDS, set())
            current.save()
        elif update_existing:
            _assign(current, row, REQUEST_FIELDS, REQUEST_UPDATE_SKIP)
            current.save()
        stored.append(current)
    return stored


def store_tasks(rows, update_existing):
    for row in rows:
        number = str(row.get("number") or "")
        request_id = str(row.get("requestId") or "")
        if not number or not OrderHistoryRequest.objects.filter(pk=request_id).exists():
            continue
        current = OrderHistoryTask.objects.filter(pk=number).first()
        if current is None:
            current = OrderHistoryTask(number=number, request_id=request_id)
            _assign(current, row, TASK_FIELDS, set())
            current.save()
        elif update_existing:
            _assign(current, row, TASK_FIELDS, TASK_UPDATE_SKIP)
            current.request_id = request_id
            current.save()


def collect_tasks(rows):
    tasks = []
    for row in rows:
        tasks.extend(row.get("taskData") or [])
    return tasks


def is_holiday(day):
    return f"{day.month}/{day.day}/{day.year}" in HOLIDAYS


def is_weekend(day):
    return day.weekday() >= 5


def calculate_due_date(request_date, offset=DUE_DAY_OFFSET):
    due = request_date
    remaining = offset
    while remaining:
        remaining -= 1
        due = due + timedelta(days=1)
        if is_holiday(due) or is_weekend(due):
            remaining += 1
    return due


def product_payload(product_id):
    if not product_id:
        return None
    from apps.marketplace.models import Product

    try:
        product = Product.objects.filter(pk=int(product_id)).only("id", "name").first()
    except (TypeError, ValueError):
        return None
    if product is None:
        return None
    return {"id": product.id, "name": product.name}


def task_payload(task):
    return {
        "number": task.number,
        "ritm": task.ritm,
        "created": task.created,
        "state": task.state,
        "due": task.due,
        "assignmentGroup": task.assignment_group,
        "assignmentGroupManager": task.assignment_group_manager,
        "assignedTo": task.assigned_to,
        "requestId": task.request_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
    }


def request_payload(row, include_related=False):
    payload = {
        "id": row.id,
        "objectId": row.object_id,
        "number": row.number,
        "closedAt": row.closed_at,
        "ritmState": row.ritm_state,
        "requestedFor": row.requested_for,
        "openedBy": row.opened_by,
        "openedAt": row.opened_at,
        "ritmAssignedTo": row.ritm_assigned_to,
        "approvalStage": row.approval_stage,
        "stage": row.stage,
        "ritmComments": row.ritm_comments,
        "ritmApprovers": row.ritm_approvers,
        "variables": row.variables,
        "formData": row.form_data,
        "productId": row.product_id,
        "productIdentifier": row.product_identifier,
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
    }
    if include_related:
        tasks = list(row.tasks.all())
        payload["task"] = task_payload(tasks[0]) if tasks else None
        payload["product"] = product_payload(row.product_id)
        if row.stage == "Waiting for Approval" and row.opened_at:
            payload["due"] = calculate_due_date(row.opened_at)
    return payload


def open_request_ids():
    floor = OPEN_REQUEST_FLOOR
    if timezone.is_naive(floor):
        floor = timezone.make_aware(floor, timezone.get_current_timezone())
    return list(
        OrderHistoryRequest.objects.filter(ritm_state="Open", opened_at__gte=floor).values_list("id", flat=True)
    )


def refresh_open_requests():
    if not snow_configured():
        return 0
    ids = open_request_ids()
    if not ids:
        return 0
    rows = get_request_details({"requestId": ids})
    store_requests(rows, update_existing=True)
    store_tasks(collect_tasks(rows), update_existing=True)
    return len(rows)
