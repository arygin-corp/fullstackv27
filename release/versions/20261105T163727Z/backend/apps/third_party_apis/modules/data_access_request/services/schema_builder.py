from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from django.core.exceptions import ValidationError
from django.db import transaction
from ..models import (FieldAction, FieldOption, FieldRule, FieldType, FormDefinition, FormField, FormSection, RuleAction, RuleEvaluationMode,
    RuleGroup, RuleOperator,
)

FIELD_TYPES = {value for value, _ in FieldType.choices}
OPERATORS = {value for value, _ in RuleOperator.choices}
ACTIONS = {value for value, _ in RuleAction.choices}
MAX_FIELDS = 250
MAX_OPTIONS = 500

@dataclass(frozen=True)
class SchemaError:
    path: str
    message: str

def export_schema(form: FormDefinition) -> dict[str, Any]:
    fields = []
    queryset = form.fields.filter(is_active=True).select_related("section").prefetch_related("options")
    for field in queryset.order_by("section__order", "order", "id"):
        fields.append({
            "id": field.pk,
            "key": field.key,
            "type": field.field_type,
            "label": field.label,
            "help_text": field.help_text,
            "placeholder": field.placeholder,
            "required": field.required,
            "hidden": field.hidden,
            "disabled": field.disabled,
            "read_only": field.read_only,
            "default": field.default_value,
            "order": field.order,
            "section": field.section.title if field.section else None,
            "options": [
                {"label": option.label, "value": option.value, "order": option.order}
                for option in field.options.filter(is_active=True).order_by("order", "id")
            ],
        })
    rules = []
    groups = form.rule_groups.filter(is_active=True).prefetch_related("rules", "actions")
    for group in groups.order_by("priority", "id"):
        conditions = [
            {"source": rule.source_field.key, "operator": rule.operator, "value": rule.comparison_value}
            for rule in group.rules.filter(is_active=True).select_related("source_field").order_by("order", "id")
        ]
        for action in group.actions.filter(is_active=True).select_related("target_field").order_by("order", "id"):
            rules.append({
                "id": group.pk,
                "name": group.name,
                "mode": group.evaluation_mode,
                "priority": group.priority,
                "conditions": conditions,
                "action": action.action_type,
                "target": action.target_field.key,
                "action_value": action.action_value,
            })
    return {
        "id": form.pk,
        "name": form.slug,
        "title": form.name,
        "description": form.description,
        "version": form.version,
        "is_published": form.is_published,
        "success_title": form.success_title,
        "success_message": form.success_message,
        "fields": fields,
        "rules": rules,
    }


def validate_schema(schema: Any) -> list[SchemaError]:
    errors: list[SchemaError] = []
    if not isinstance(schema, dict):
        return [SchemaError("schema", "Schema must be a JSON object.")]
    fields = schema.get("fields", [])
    rules = schema.get("rules", [])
    if not isinstance(fields, list):
        return [SchemaError("fields", "Fields must be a list.")]
    if len(fields) > MAX_FIELDS:
        errors.append(SchemaError("fields", f"A form may contain at most {MAX_FIELDS} fields."))
    keys: set[str] = set()
    for index, field in enumerate(fields):
        path = f"fields[{index}]"
        if not isinstance(field, dict):
            errors.append(SchemaError(path, "Field must be an object.")); continue
        key = str(field.get("key", "")).strip()
        if not key or not key.replace("_", "").isalnum() or key[0].isdigit():
            errors.append(SchemaError(f"{path}.key", "Use letters, numbers, and underscores; do not start with a number."))
        elif key in keys:
            errors.append(SchemaError(f"{path}.key", "Field keys must be unique."))
        keys.add(key)
        if field.get("type") not in FIELD_TYPES:
            errors.append(SchemaError(f"{path}.type", "Unsupported field type."))
        options = field.get("options", [])
        if not isinstance(options, list) or len(options) > MAX_OPTIONS:
            errors.append(SchemaError(f"{path}.options", f"Options must be a list with at most {MAX_OPTIONS} entries."))
    if not isinstance(rules, list):
        errors.append(SchemaError("rules", "Rules must be a list.")); return errors
    for index, rule in enumerate(rules):
        path = f"rules[{index}]"
        if not isinstance(rule, dict):
            errors.append(SchemaError(path, "Rule must be an object.")); continue
        conditions = rule.get("conditions", [])
        if not isinstance(conditions, list) or not conditions:
            errors.append(SchemaError(f"{path}.conditions", "At least one condition is required.")); continue
        for position, condition in enumerate(conditions):
            source = condition.get("source")
            if source not in keys:
                errors.append(SchemaError(f"{path}.conditions[{position}].source", "Source field does not exist."))
            if condition.get("operator") not in OPERATORS:
                errors.append(SchemaError(f"{path}.conditions[{position}].operator", "Unsupported operator."))
        if rule.get("target") not in keys:
            errors.append(SchemaError(f"{path}.target", "Target field does not exist."))
        if rule.get("action") not in ACTIONS:
            errors.append(SchemaError(f"{path}.action", "Unsupported action."))
    return errors


@transaction.atomic
def save_schema(form: FormDefinition, schema: dict[str, Any], *, actor=None) -> FormDefinition:
    errors = validate_schema(schema)
    if errors:
        raise ValidationError({error.path: error.message for error in errors})

    form.name = str(schema.get("title") or form.name)[:200]
    form.description = str(schema.get("description") or "")
    form.success_title = str(schema.get("success_title") or form.success_title)[:255]
    form.success_message = str(schema.get("success_message") or "")
    form.is_published = False
    form.updated_by = actor
    form.save()

    sections: dict[str, FormSection] = {
        section.title: section for section in form.sections.all()
    }
    existing_fields = {field.key: field for field in form.fields.all()}
    retained_ids: set[int] = set()
    field_map: dict[str, FormField] = {}

    for index, item in enumerate(schema.get("fields", [])):
        section_name = item.get("section")
        section = None
        if section_name:
            section = sections.get(section_name)
            if section is None:
                section = FormSection.objects.create(
                    form=form, title=section_name, order=len(sections) * 10,
                    created_by=actor, updated_by=actor,
                )
                sections[section_name] = section
        field = existing_fields.get(item["key"]) or FormField(
            form=form, key=item["key"], created_by=actor,
        )
        field.section = section
        field.label = item.get("label") or item["key"]
        field.field_type = item["type"]
        field.help_text = item.get("help_text", "")
        field.placeholder = item.get("placeholder", "")
        field.required = bool(item.get("required"))
        field.hidden = bool(item.get("hidden"))
        field.disabled = bool(item.get("disabled"))
        field.read_only = bool(item.get("read_only"))
        field.default_value = item.get("default")
        field.order = index * 10
        field.is_active = True
        field.updated_by = actor
        field.save()
        retained_ids.add(field.pk)
        field_map[field.key] = field

        field.options.all().delete()
        FieldOption.objects.bulk_create([
            FieldOption(
                field=field,
                label=str(option.get("label", option.get("value", ""))),
                value=str(option.get("value", "")),
                order=position * 10,
                created_by=actor,
                updated_by=actor,
            )
            for position, option in enumerate(item.get("options", []))
        ])

    for obsolete in form.fields.exclude(pk__in=retained_ids):
        if obsolete.submitted_values.exists():
            obsolete.is_active = False
            obsolete.updated_by = actor
            obsolete.save(update_fields=["is_active", "updated_by", "updated_at"])
        else:
            obsolete.delete()

    form.rule_groups.all().delete()
    for index, item in enumerate(schema.get("rules", [])):
        group = RuleGroup.objects.create(
            form=form,
            name=item.get("name") or f"Rule {index + 1}",
            evaluation_mode=item.get("mode", RuleEvaluationMode.ALL),
            priority=int(item.get("priority", index * 10)),
            created_by=actor,
            updated_by=actor,
        )
        FieldRule.objects.bulk_create([
            FieldRule(
                group=group,
                source_field=field_map[condition["source"]],
                target_field=field_map[item["target"]],
                operator=condition["operator"],
                comparison_value=condition.get("value"),
                action=item["action"],
                order=position * 10,
                created_by=actor,
                updated_by=actor,
            )
            for position, condition in enumerate(item["conditions"])
        ])
        FieldAction.objects.create(
            group=group,
            target_field=field_map[item["target"]],
            action_type=item["action"],
            action_value=item.get("action_value"),
            created_by=actor,
            updated_by=actor,
        )
    return form
