import re
from django.apps import apps
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.utils import timezone

from .models import ProductCheckoutRequest


SENSITIVE_CLASSIFICATIONS = {
    "Confidential",
    "Highly Confidential",
    "Personal Information",
    "Legal/Privileged",
}


def get_product_model(model_label=""):
    label = model_label or getattr(
        settings,
        "PRODUCT_CHECKOUT_PRODUCT_MODEL",
        "products.Product",
    )
    try:
        return apps.get_model(label)
    except (LookupError, ValueError) as exc:
        raise ImproperlyConfigured(
            f"Invalid PRODUCT_CHECKOUT_PRODUCT_MODEL: {label}"
        ) from exc


def attr(obj, path, default=""):
    value = obj
    for part in path.split("."):
        value = getattr(value, part, default)
        if value is default:
            break
    return value


def product_snapshot(product):
    mapping = getattr(settings, "PRODUCT_CHECKOUT_PRODUCT_FIELDS", {})
    defaults = {
        "id": "pk",
        "name": "name",
        "description": "description",
        "datatype": "datatype",
        "platform": "platform",
        "classification": "classification",
        "domain": "onetsdomain",
        "environment": "env",
        "access_type": "access_type",
        "data_access_type": "dataaccess_type",
        "pii": "pii",
        "intended_use": "intended_use",
        "adgroup": "adgroup",
        "controlgroup": "controlgroup",
        "routeidentifier": "routeidentifier",
        "tbdp_pricing": "TBDP_pricing",
    }
    defaults.update(mapping)
    return {key: attr(product, path, "") for key, path in defaults.items()}


def user_snapshot(user):
    return {
        "id": str(user.pk),
        "username": user.get_username(),
        "email": getattr(user, "email", "") or "",
        "first_name": getattr(user, "first_name", "") or "",
        "last_name": getattr(user, "last_name", "") or "",
    }


def is_empty(value):
    return value in (None, "", [], {}, ())


def matches(value, operator, expected):
    if operator == "equals":
        return value == expected
    if operator == "not_equals":
        return value != expected
    if operator == "in":
        return value in (expected or [])
    if operator == "not_in":
        return value not in (expected or [])
    if operator == "is_empty":
        return is_empty(value)
    if operator == "is_not_empty":
        return not is_empty(value)
    if operator == "contains":
        try:
            return expected in value
        except TypeError:
            return False
    return False


def _source_value(values, source_key):
    return values.get(source_key)


def _group_matches(group, values):
    conditions = list(
        group.conditions.filter(is_active=True).order_by("order", "id")
    )
    if not conditions:
        return False
    results = [
        matches(
            _source_value(values, condition.source_key),
            condition.operator,
            condition.comparison_value,
        )
        for condition in conditions
    ]
    return any(results) if group.evaluation_mode == "any" else all(results)


def resolve_field_states(configuration, submitted_values, context):
    """Resolve field visibility, required state and calculated values.

    The engine supports both the existing ProductCheckoutRule rows and the
    new grouped condition/action metadata. Grouped rules run after legacy
    rules and therefore are authoritative when both are configured.
    """
    values = {**context, **submitted_values}

    # Product identity is authoritative and cannot be supplied by the client.
    # These calculated form variables are required by the existing checkout
    # payload sent to ServiceNow.
    product = context.get("product", {})
    values["v_dar_product_name"] = str(product.get("name", "") or "")
    values["v_dar_product_id"] = str(product.get("id", "") or "")
    submitted_values = {
        **submitted_values,
        "v_dar_product_name": values["v_dar_product_name"],
        "v_dar_product_id": values["v_dar_product_id"],
    }

    states = {
        key: {
            "visible": True,
            "required": False,
            "disabled": False,
            "value": value,
        }
        for key, value in submitted_values.items()
    }

    for question in configuration.questions.filter(is_active=True):
        states.setdefault(
            question.key,
            {
                "visible": True,
                "required": question.required,
                "disabled": False,
                "value": submitted_values.get(
                    question.key,
                    question.default_value,
                ),
            },
        )
        states[question.key]["required"] = question.required

    def apply(target_key, action_type, action_value):
        state = states.setdefault(
            target_key,
            {
                "visible": True,
                "required": False,
                "disabled": False,
                "value": values.get(target_key),
            },
        )
        if action_type == "show":
            state["visible"] = True
        elif action_type == "hide":
            state.update(visible=False, required=False, value=None)
        elif action_type == "require":
            state["required"] = True
        elif action_type == "optional":
            state["required"] = False
        elif action_type == "enable":
            state["disabled"] = False
        elif action_type == "disable":
            state.update(disabled=True, value=None)
        elif action_type == "set_value":
            state["value"] = action_value
        elif action_type == "clear_value":
            state["value"] = None
        values[target_key] = state["value"]

    for rule in configuration.rules.filter(is_active=True).order_by("order", "id"):
        if matches(
            _source_value(values, rule.source_key),
            rule.operator,
            rule.comparison_value,
        ):
            apply(rule.target_key, rule.action, rule.action_value)

    for group in configuration.rule_groups.filter(is_active=True).prefetch_related(
        "conditions", "actions"
    ).order_by("priority", "id"):
        if not _group_matches(group, values):
            continue
        for action in group.actions.filter(is_active=True).order_by("order", "id"):
            apply(action.target_key, action.action_type, action.action_value)

    return states


def validate_values(configuration, submitted_values, context):
    states = resolve_field_states(configuration, submitted_values, context)
    errors = {}
    question_map = {
        question.key: question
        for question in configuration.questions.filter(is_active=True)
    }

    for key, state in states.items():
        if not state["visible"] or state["disabled"]:
            continue
        value = state["value"]
        if state["required"] and is_empty(value):
            errors[key] = "This field is required."
            continue
        question = question_map.get(key)
        if question is None or is_empty(value):
            continue
        if isinstance(value, str):
            if question.min_length is not None and len(value) < question.min_length:
                errors[key] = f"Minimum length is {question.min_length}."
            elif question.max_length is not None and len(value) > question.max_length:
                errors[key] = f"Maximum length is {question.max_length}."
            elif question.regex_pattern and not re.fullmatch(
                question.regex_pattern,
                value,
            ):
                errors[key] = "Invalid format."

    for rule in configuration.validation_rules.filter(is_active=True).order_by(
        "order", "id"
    ):
        state = states.get(rule.field_key, {})
        if not state.get("visible", True) or state.get("disabled", False):
            continue
        value = state.get("value", submitted_values.get(rule.field_key))
        invalid = False
        expected = rule.validation_value
        if rule.validation_type == "required":
            invalid = is_empty(value)
        elif rule.validation_type == "required_true":
            invalid = value is not True
        elif rule.validation_type == "min_length" and not is_empty(value):
            invalid = len(str(value)) < int(expected)
        elif rule.validation_type == "max_length" and not is_empty(value):
            invalid = len(str(value)) > int(expected)
        elif rule.validation_type == "regex" and not is_empty(value):
            invalid = re.fullmatch(str(expected), str(value)) is None
        elif rule.validation_type == "email" and not is_empty(value):
            invalid = re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", str(value)) is None
        elif rule.validation_type == "number" and not is_empty(value):
            try:
                float(value)
            except (TypeError, ValueError):
                invalid = True
        elif rule.validation_type == "one_of" and not is_empty(value):
            invalid = value not in (expected or [])
        if invalid:
            errors[rule.field_key] = rule.error_message

    return errors, states


def _safe_format(template, values):
    if not template:
        return ""

    def replace(match):
        key = match.group(1)
        value = values.get(key)
        return "" if value is None else str(value)

    return re.sub(r"\{([^{}]+)\}", replace, template)


def resolve_routing(configuration, submitted_values, context):
    values = {**context, **submitted_values}
    product = context.get("product", {})
    route = {
        "route_identifier": str(product.get("routeidentifier", "") or ""),
        "fulfillment_group": str(product.get("adgroup", "") or ""),
        "control_group": str(product.get("controlgroup", "") or ""),
        "organization": str(submitted_values.get("v_dar_organization", "") or ""),
        "ad_group": str(product.get("adgroup", "") or ""),
        "matched_rule": None,
    }

    for routing_rule in configuration.routing_rules.filter(is_active=True).order_by(
        "priority", "id"
    ):
        conditions = routing_rule.conditions or []
        if not all(
            matches(
                _source_value(values, condition.get("source_key", "")),
                condition.get("operator", "equals"),
                condition.get("comparison_value"),
            )
            for condition in conditions
        ):
            continue
        if routing_rule.route_identifier:
            route["route_identifier"] = routing_rule.route_identifier
        if routing_rule.fulfillment_group:
            route["fulfillment_group"] = routing_rule.fulfillment_group
        if routing_rule.control_group:
            route["control_group"] = routing_rule.control_group
        if routing_rule.organization:
            route["organization"] = routing_rule.organization
        rendered_ad_group = _safe_format(routing_rule.ad_group_template, values)
        if rendered_ad_group:
            route["ad_group"] = rendered_ad_group
        route["matched_rule"] = routing_rule.name
        if routing_rule.stop_processing:
            break
    return route


def checkout_context(product, user, submitted_values=None):
    snapshot = product_snapshot(product)
    submitted_values = submitted_values or {}
    return {
        "request_type": submitted_values.get("requesting_id", "Me"),
        "product": snapshot,
        **{f"product.{key}": value for key, value in snapshot.items()},
        **submitted_values,
    }


def next_request_number():
    prefix = timezone.localdate().strftime("PC-%Y%m%d")
    with transaction.atomic():
        count = (
            ProductCheckoutRequest.objects.select_for_update()
            .filter(request_number__startswith=prefix)
            .count()
            + 1
        )
        return f"{prefix}-{count:05d}"
