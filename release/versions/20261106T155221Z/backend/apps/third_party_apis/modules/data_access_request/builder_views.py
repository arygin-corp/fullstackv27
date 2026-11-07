import json
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods
from .models import FormDefinition
from .services.schema_builder import export_schema, save_schema, validate_schema

@staff_member_required
def builder(request, pk):
    form = get_object_or_404(FormDefinition, pk=pk)
    return render(request, "gdx_admin/apps/dar/forms/builder.html", {"form_definition": form, "initial_schema": export_schema(form)})

@staff_member_required
@require_http_methods(["GET", "PUT"])
def builder_schema(request, pk):
    form = get_object_or_404(FormDefinition, pk=pk)
    if request.method == "GET":
        return JsonResponse(export_schema(form))
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"errors": {"schema": "Invalid JSON."}}, status=400)
    errors = validate_schema(payload)
    if errors:
        return JsonResponse({"errors": {error.path: error.message for error in errors}}, status=400)
    try:
        save_schema(form, payload, actor=request.user)
    except ValidationError as exc:
        return JsonResponse({"errors": exc.message_dict}, status=400)
    return JsonResponse(export_schema(form))

@staff_member_required
@require_http_methods(["POST"])
def builder_publish(request, pk):
    form = get_object_or_404(FormDefinition, pk=pk)
    errors = validate_schema(export_schema(form))
    if errors:
        return JsonResponse({"errors": {error.path: error.message for error in errors}}, status=400)
    form.is_published = True
    form.updated_by = request.user
    form.save(update_fields=["is_published", "updated_by", "updated_at"])
    return JsonResponse({"is_published": True, "version": form.version})
