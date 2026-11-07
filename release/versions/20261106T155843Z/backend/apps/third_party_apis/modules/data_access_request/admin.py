from django.contrib import admin

from .models import (
    FieldAction,
    FieldOption,
    FieldRule,
    FormChangeLog,
    FormDefinition,
    FormField,
    FormSection,
    FormSubmission,
    RoutingRule,
    RuleGroup,
    ValidationRule,
)


class AuditAdmin(admin.ModelAdmin):
    readonly_fields = ("created_by", "created_at", "updated_by", "updated_at")

    def save_model(self, request, obj, form, change):
        if obj._state.adding and not obj.created_by_id:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


admin.site.register(
    [
        FormDefinition,
        FormSection,
        FormField,
        FieldOption,
        RuleGroup,
        FieldRule,
        FieldAction,
        ValidationRule,
        RoutingRule,
    ],
    AuditAdmin,
)


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "request_number", "form", "status", "submitted_by", "submitted_at")
    readonly_fields = tuple(field.name for field in FormSubmission._meta.fields)


@admin.register(FormChangeLog)
class FormChangeLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "object_model", "object_pk", "actor_label", "source")
    readonly_fields = tuple(field.name for field in FormChangeLog._meta.fields)
