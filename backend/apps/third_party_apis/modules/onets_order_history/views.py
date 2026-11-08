import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.exceptions import AuthenticationFailed

from apps.orders.authentication import MarketplaceSignInAuthentication
from apps.orders.models import UserActivity

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
    for key, order_type in (("cart_items", "product"), ("dar_requests", "dar")):
        for item in variables.get(key) or []:
            data = item.get("formData") if isinstance(item, dict) else None
            if isinstance(data, dict) and data:
                data = dict(data)
                data["order_type"] = item.get("order_type") or data.get("order_type") or order_type
                _mark_checkout_source(data)
                _apply_alt_approver(data)
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


def _signed_in_actor(request):
    try:
        authenticated = MarketplaceSignInAuthentication().authenticate(request)
    except AuthenticationFailed:
        return "", ""
    if not authenticated:
        return "", ""
    _user, claims = authenticated
    object_id = str(claims.get("oid") or "").strip()
    email = ""
    for key in ("preferred_username", "email", "upn"):
        value = claims.get(key)
        if isinstance(value, str) and "@" in value:
            email = value.strip()
            break
    return object_id, email


def _apply_alt_approver(data):
    """Replace the data-domain control group with the product alternate approver sys_id."""
    if data.get("order_type") == "dar":
        return data
    product_id = data.get("productId") or data.get("product_id")
    if not product_id:
        return data
    from apps.marketplace.models import Product

    try:
        product = (
            Product.objects.select_related("alt_approver")
            .filter(pk=product_id)
            .first()
        )
    except Exception:
        return data
    if product is None or getattr(product, "alt_approver_id", None) is None:
        return data
    data["v_custom_control_group"] = product.alt_approver.sys_id or ""
    return data


def _mark_checkout_source(data):
    """A product checkout is either an AI suggestion or a standard product."""
    if data.get("order_type") == "dar":
        return data
    suggested = bool(data.get("ai_suggested"))
    data["ai_suggested"] = suggested
    data["source"] = "ai_suggested" if suggested else "standard"
    return data


def _audit_line(form):
    return {
        "order_type": form.get("order_type") or "",
        "name": form.get("product_name") or form.get("v_dar_platform") or "",
        "product_id": form.get("productId") or form.get("product_id") or "",
        "domain": form.get("domain") or form.get("v_dar_dataDomainSelect") or "",
        "datatype": form.get("datatype") or "",
        "classification": form.get("classification") or "",
        "platform": form.get("v_dar_platform") or "",
        "environment": form.get("v_dar_environment") or "",
        "access_type": form.get("v_dat_data_access_type") or "",
        "ai_suggested": bool(form.get("ai_suggested")),
        "source": "ai_suggested" if form.get("ai_suggested") else "standard",
    }


def _audit_submitted_order(request, variables, forms, request_number, ritm_number, order_type):
    object_id, email = _signed_in_actor(request)
    if not object_id:
        object_id = str(variables.get("v_dar_objectid_createdby") or forms[0].get("v_dar_objectid_createdby") or "").strip()
    names = [line["name"] for line in (_audit_line(form) for form in forms) if line["name"]]
    detail = ", ".join(names) or ("Data access request" if order_type == "dar" else "Catalog product")
    try:
        UserActivity.objects.create(
            object_id=object_id[:255],
            email=email[:254],
            action="order_submitted",
            title="Order submitted",
            detail=detail[:255],
            reference=str(request_number)[:255],
            payload={
                "order_type": order_type,
                "request_number": request_number,
                "ritm_number": ritm_number,
                "ai_suggested": any(bool(form.get("ai_suggested")) for form in forms),
                "items": [_audit_line(form) for form in forms],
            },
        )
    except Exception:
        return


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
    variables = body.get("variables") if isinstance(body.get("variables"), dict) else {}
    order_type = str(forms[0].get("order_type") or body.get("order_type") or variables.get("order_type") or "").strip().lower()
    if order_type not in ("product", "dar"):
        order_type = "dar" if variables.get("dar_requests") else "product"
    _audit_submitted_order(request, variables, forms, primary.number, ritm, order_type)
    return JsonResponse({
        "result": {
            "number": primary.number,
            "request_number": primary.number,
            "request_id": primary.id,
            "ritm_id": primary.id,
            "sys_id": primary.id,
            "ritm_number": ritm,
            "order_type": order_type,
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
