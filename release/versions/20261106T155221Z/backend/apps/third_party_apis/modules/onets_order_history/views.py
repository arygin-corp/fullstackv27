import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import OrderHistoryRequest
from .services import (
    CREATE_OPENED_AT,
    ServiceNowError,
    collect_tasks,
    find_and_save_requests,
    get_request_details,
    request_payload,
    store_requests,
    store_tasks,
)


def _body(request):
    if not request.body:
        return None
    try:
        return json.loads(request.body.decode() or "null")
    except json.JSONDecodeError:
        return None


def _snow_error(error):
    return JsonResponse({"message": error.message}, status=error.status_code)


@csrf_exempt
@require_http_methods(["GET"])
def find_all(request):
    rows = OrderHistoryRequest.objects.all()
    object_id = request.GET.get("objectId")
    if object_id is not None:
        rows = rows.filter(object_id=object_id)
    return JsonResponse([request_payload(row) for row in rows], safe=False)


@csrf_exempt
@require_http_methods(["GET"])
def find_and_save(request):
    try:
        rows = find_and_save_requests(request.GET)
    except ServiceNowError as error:
        return _snow_error(error)
    stored = store_requests(rows, update_existing=False)
    store_tasks(collect_tasks(rows), update_existing=False)
    return JsonResponse([request_payload(row) for row in stored], safe=False)


@csrf_exempt
@require_http_methods(["PUT"])
def update_event(request):
    try:
        rows = get_request_details({"requestId": _body(request)})
    except ServiceNowError as error:
        return _snow_error(error)
    store_requests(rows, update_existing=True)
    store_tasks(collect_tasks(rows), update_existing=True)
    return JsonResponse({"message": "Records updated successfully."})


@csrf_exempt
@require_http_methods(["POST"])
def save_request(request):
    body = _body(request) or {}
    request_id = body.get("requestNum")
    if not request_id:
        return JsonResponse({"message": "Content can not be empty!"}, status=400)
    current = OrderHistoryRequest.objects.filter(pk=request_id).first()
    if current is not None:
        current.object_id = body.get("objectId") or ""
        current.product_id = "" if body.get("productId") is None else str(body.get("productId"))
        current.product_identifier = "" if body.get("productIdentifier") is None else str(body.get("productIdentifier"))
        current.form_data = body.get("formData")
        current.save()
        return JsonResponse({"message": f"Request {request_id} updates product id {current.product_identifier} successfully."})
    created = OrderHistoryRequest.objects.create(
        id=request_id,
        object_id=body.get("objectId") or "",
        product_id="" if body.get("productId") is None else str(body.get("productId")),
        product_identifier="" if body.get("productIdentifier") is None else str(body.get("productIdentifier")),
        stage="Waiting for Approval",
        approval_stage="Requested",
        ritm_state="Open",
        opened_at=CREATE_OPENED_AT,
        form_data=body.get("formData"),
    )
    return JsonResponse(request_payload(created), safe=False)


def _order_forms(body):
    variables = body.get("variables") if isinstance(body, dict) else None
    if not isinstance(variables, dict):
        variables = body if isinstance(body, dict) else {}
    forms = []
    for key in ("cart_items", "dar_requests"):
        for item in variables.get(key) or []:
            data = item.get("formData") if isinstance(item, dict) else None
            if isinstance(data, dict) and data:
                forms.append(data)
    if forms:
        return forms
    if variables:
        return [variables]
    return []


def _create_order(form):
    from django.utils import timezone

    stamp = timezone.now()
    token = stamp.strftime("%Y%m%d%H%M%S%f")
    number = "REQ" + token[-12:]
    object_id = form.get("v_dar_objectid_reqfor") or form.get("v_dar_objectid_createdby") or ""
    product_id = form.get("productId") or form.get("product_id") or ""
    return OrderHistoryRequest.objects.create(
        id=number,
        number=number,
        object_id=str(object_id or ""),
        product_id="" if product_id is None else str(product_id),
        product_identifier="" if product_id is None else str(product_id),
        requested_for=str(form.get("v_dar_workdayID") or ""),
        opened_by=str(form.get("v_dar_workdayID_created_by") or ""),
        stage="Waiting for Approval",
        approval_stage="Requested",
        ritm_state="Open",
        opened_at=stamp,
        form_data=form,
        variables=form,
    )


@csrf_exempt
@require_http_methods(["POST"])
def submit_order(request):
    """Accept a product checkout or a data-access form and store the order."""
    body = _body(request) or {}
    forms = _order_forms(body)
    if not forms:
        return JsonResponse({"message": "Content can not be empty!"}, status=400)
    created = [_create_order(form) for form in forms]
    primary = created[0]
    ritm = "RITM" + primary.number[3:]
    return JsonResponse({
        "result": {
            "number": primary.number,
            "request_number": primary.number,
            "request_id": primary.id,
            "ritm_id": primary.id,
            "sys_id": primary.id,
            "ritm_number": ritm,
        },
        "orders": [request_payload(row) for row in created],
    })


@csrf_exempt
@require_http_methods(["POST"])
def upload_attachment(request):
    upload = None
    for key in ("file", "uploadFile", "upload"):
        upload = request.FILES.get(key)
        if upload:
            break
    if upload is None and request.FILES:
        upload = next(iter(request.FILES.values()))
    if upload is None:
        return JsonResponse({"message": "Content can not be empty!"}, status=400)
    from django.core.files.storage import default_storage

    stored = default_storage.save(f"dar-uploads/{upload.name}", upload)
    return JsonResponse({
        "result": {
            "file_name": upload.name,
            "sys_id": stored,
            "path": stored,
        }
    })


@csrf_exempt
@require_http_methods(["GET"])
def load_products(request):
    requested_for = request.GET.get("requestedFor")
    if not requested_for:
        return JsonResponse({"message": "Content can not be empty!"}, status=400)
    rows = OrderHistoryRequest.objects.filter(object_id=requested_for).prefetch_related("tasks")
    return JsonResponse([request_payload(row, include_related=True) for row in rows], safe=False)
