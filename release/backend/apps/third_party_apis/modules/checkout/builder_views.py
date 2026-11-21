import json

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .services.form_builder import clear_definition, export_definition, load_definition, save_definition, validate_document


@staff_member_required
def checkout_form_builder(request):
    saved = load_definition()
    document = saved or export_definition()
    field_count = sum(len(section.get("fields") or []) for section in document.get("sections") or [])
    return render(request, "gdx_admin/pages/checkout/checkout_form_builder.html", {
        "page_title": "Checkout Form Builder",
        "document_saved": saved is not None,
        "field_count": field_count,
        "initial_document": document,
    })


@staff_member_required
@require_http_methods(["GET", "PUT", "DELETE"])
def checkout_form_builder_document(request):
    if request.method == "GET":
        saved = load_definition()
        return JsonResponse({"saved": saved is not None, "document": saved or export_definition()})
    if request.method == "DELETE":
        clear_definition()
        return JsonResponse({"saved": False, "document": export_definition()})
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"errors": ["The document is not valid JSON."]}, status=400)
    document = payload.get("document", payload)
    errors = validate_document(document)
    if errors:
        return JsonResponse({"errors": errors}, status=400)
    save_definition(document, request.user)
    return JsonResponse({"saved": True, "document": document})
