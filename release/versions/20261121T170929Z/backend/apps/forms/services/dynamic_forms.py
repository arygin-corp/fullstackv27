from __future__ import annotations

from typing import Any

from django import forms
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from ..models import FieldType, FormSubmission, SubmissionStatus, SubmissionValue
from .rules import RoutingEngine, RuleConfigurationError, RuleEngine, ValidationEngine


class DynamicForm(forms.Form):
    """Django form generated from an active, published FormDefinition."""

    def __init__(self, *args, definition, **kwargs):
        self.definition = definition
        self.definition_fields = list(
            definition.fields.filter(is_active=True)
            .select_related("section")
            .prefetch_related("options", "validation_rules")
            .order_by("section__order", "order", "id")
        )
        super().__init__(*args, **kwargs)
        self.model_fields = {field.key: field for field in self.definition_fields}
        initial_values = {
            field.id: self.initial.get(field.key, field.default_value)
            for field in self.definition_fields
        }
        self.states = RuleEngine.resolve(definition, initial_values)
        for model_field in self.definition_fields:
            if model_field.field_type == FieldType.STATIC_TEXT:
                continue
            self.fields[model_field.key] = make_django_field(
                model_field, self.states[model_field.id]
            )

    def clean(self):
        cleaned = super().clean()
        values_by_id = {
            model_field.id: cleaned.get(model_field.key)
            for model_field in self.definition_fields
        }
        errors, self.states = ValidationEngine.validate(self.definition, values_by_id)
        for key, message in errors.items():
            self.add_error(key, message)
        return cleaned


def make_django_field(model_field, state):
    options = [
        (option.value, option.label)
        for option in model_field.options.filter(is_active=True).order_by("order", "id")
    ]
    common = {
        "label": model_field.label,
        "required": bool(state.required and not state.hidden and not state.disabled),
        "help_text": model_field.help_text,
        "initial": state.value,
        "disabled": bool(state.disabled or state.read_only),
    }
    attrs = {"placeholder": model_field.placeholder} if model_field.placeholder else {}
    field_type = model_field.field_type
    if field_type == FieldType.TEXTAREA:
        return forms.CharField(widget=forms.Textarea(attrs=attrs), min_length=model_field.min_length, max_length=model_field.max_length, **common)
    if field_type == FieldType.EMAIL:
        return forms.EmailField(widget=forms.EmailInput(attrs=attrs), **common)
    if field_type == FieldType.INTEGER:
        return forms.IntegerField(widget=forms.NumberInput(attrs=attrs), **common)
    if field_type == FieldType.DECIMAL:
        return forms.DecimalField(widget=forms.NumberInput(attrs=attrs), **common)
    if field_type == FieldType.DATE:
        return forms.DateField(widget=forms.DateInput(attrs={**attrs, "type": "date"}), **common)
    if field_type == FieldType.DATETIME:
        return forms.DateTimeField(widget=forms.DateTimeInput(attrs={**attrs, "type": "datetime-local"}), **common)
    if field_type == FieldType.CHECKBOX:
        return forms.BooleanField(widget=forms.CheckboxInput(), **common)
    if field_type == FieldType.SELECT:
        return forms.ChoiceField(choices=[("", "Select...")] + options, **common)
    if field_type == FieldType.MULTISELECT:
        return forms.MultipleChoiceField(choices=options, widget=forms.SelectMultiple(), **common)
    if field_type == FieldType.RADIO:
        return forms.ChoiceField(choices=options, widget=forms.RadioSelect(), **common)
    if field_type == FieldType.HIDDEN:
        return forms.CharField(widget=forms.HiddenInput(), **common)
    # User lookups require a project-specific provider; render as text by default.
    return forms.CharField(widget=forms.TextInput(attrs=attrs), min_length=model_field.min_length, max_length=model_field.max_length, **common)


@transaction.atomic
def persist_submission(*, definition, dynamic_form: DynamicForm, user=None, context=None):
    if not dynamic_form.is_valid():
        raise ValidationError("Cannot persist an invalid dynamic form.")
    values = {
        field.id: dynamic_form.cleaned_data.get(field.key)
        for field in dynamic_form.definition_fields
        if field.field_type != FieldType.STATIC_TEXT and field.key in dynamic_form.cleaned_data
    }
    try:
        routing = RoutingEngine.resolve(definition, values)
    except RuleConfigurationError as exc:
        raise ValidationError(str(exc)) from exc
    submission = FormSubmission.objects.create(
        form=definition,
        form_version=definition.version,
        status=SubmissionStatus.SUBMITTED,
        context={**(context or {}), "routing": routing},
        submitted_by=user if getattr(user, "is_authenticated", False) else None,
        submitted_at=timezone.now(),
        created_by=user if getattr(user, "is_authenticated", False) else None,
        updated_by=user if getattr(user, "is_authenticated", False) else None,
    )
    SubmissionValue.objects.bulk_create([
        SubmissionValue(
            submission=submission,
            field=field,
            value=values[field.id],
            created_by=user if getattr(user, "is_authenticated", False) else None,
            updated_by=user if getattr(user, "is_authenticated", False) else None,
        )
        for field in dynamic_form.definition_fields
        if field.id in values
    ])
    return submission



# In DynamicForm.__init__, replace initial_values with:
def build_initial_values(dynamic_form):
    def raw_value(field):
        if not dynamic_form.is_bound:
            return dynamic_form.initial.get(field.key, field.default_value)
        if field.field_type == FieldType.MULTISELECT:
            return dynamic_form.data.getlist(field.key)
        if field.field_type == FieldType.CHECKBOX:
            return field.key in dynamic_form.data
        return dynamic_form.data.get(field.key, field.default_value)

    return {field.id: raw_value(field) for field in dynamic_form.definition_fields}


# In persist_submission, replace the value/routing block with:
def build_submission_values(dynamic_form):
    values_by_id = {
        field.id: dynamic_form.cleaned_data.get(field.key)
        for field in dynamic_form.definition_fields
        if field.field_type != FieldType.STATIC_TEXT
        and field.key in dynamic_form.cleaned_data
    }
    values_by_key = {
        field.key: values_by_id.get(field.id)
        for field in dynamic_form.definition_fields
    }
    return values_by_id, values_by_key