# from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from .models import FormDefinition
from .services.dynamic_forms import DynamicForm, persist_submission
from .services.schema_builder import export_schema


# @login_required
@require_http_methods(["GET", "POST"])
def render_form(request, slug):
    definition = get_object_or_404(
        FormDefinition.objects.prefetch_related(
            "fields__options", "fields__validation_rules", "rule_groups__rules", "rule_groups__actions"
        ),
        slug=slug,
        is_active=True,
        is_published=True,
    )
    dynamic_form = DynamicForm(
        request.POST or None,
        definition=definition,
    )
    if request.method == "POST" and dynamic_form.is_valid():
        submission = persist_submission(
            definition=definition,
            dynamic_form=dynamic_form,
            user=request.user,
            context={"source": "django-renderer"},
        )
        return redirect(reverse("dar-admin:form-success", kwargs={"slug": slug, "submission_id": submission.pk}))
    return render(request, "forms/render_form.html", {
        "definition": definition,
        "dynamic_form": dynamic_form,
        "schema": export_schema(definition),
    })


# @login_required
def form_success(request, slug, submission_id):
    definition = get_object_or_404(FormDefinition, slug=slug, is_active=True)
    submission = get_object_or_404(definition.submissions, pk=submission_id, submitted_by=request.user)
    return render(request, "forms/submission_success.html", {"definition": definition, "submission": submission})
