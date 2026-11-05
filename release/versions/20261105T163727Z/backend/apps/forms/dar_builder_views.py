import json

from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from apps.forms.services.dar_form_builder import (
    clear_definition,
    export_definition,
    load_definition,
    refresh_labels,
    save_definition,
)
from apps.forms.services.marketplace_choices import apply_marketplace_choices, choices_for, source_catalog


def _payload():
    stored = load_definition()
    if stored is None:
        document = export_definition()
        saved = False
    else:
        document = refresh_labels(json.loads(json.dumps(stored)))
        saved = True
    return {"document": apply_marketplace_choices(document), "saved": saved}


@staff_member_required
def dar_form_builder(request):
    payload = _payload()
    document = payload["document"]
    field_count = sum(len(section.get("fields") or []) for section in document.get("sections") or [])
    return render(
        request,
        "gdx_admin/apps/dar/forms/dar_form_builder.html",
        {
            "initial_document": document,
            "field_count": field_count,
            "document_saved": payload["saved"],
            "marketplace_sources": source_catalog(),
        },
    )


@staff_member_required
@require_http_methods(["GET"])
def dar_marketplace_choices(request, source):
    known = {item["key"]: item["label"] for item in source_catalog()}
    if source not in known:
        return JsonResponse({"errors": ["Unknown marketplace catalog."]}, status=404)
    return JsonResponse({"source": source, "label": known[source], "options": choices_for(source)})


@require_http_methods(["GET", "PUT", "DELETE"])
def dar_form_builder_document(request):
    if request.method == "GET":
        return JsonResponse(_payload())
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({"errors": ["Staff access is required."]}, status=403)
    if request.method == "DELETE":
        clear_definition()
        return JsonResponse({"document": apply_marketplace_choices(export_definition()), "saved": False})
    try:
        body = json.loads(request.body.decode() or "{}")
        save_definition(body.get("document") or {}, user=request.user)
    except (ValidationError, json.JSONDecodeError) as exc:
        messages = getattr(exc, "messages", None) or [str(exc)]
        return JsonResponse({"errors": messages}, status=400)
    return JsonResponse({"document": apply_marketplace_choices(load_definition()), "saved": True})
