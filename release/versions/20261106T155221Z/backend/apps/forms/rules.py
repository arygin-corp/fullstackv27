import re
from dataclasses import dataclass, replace
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404, render
from .models import (
    RuleGroup,
    FieldType,
    RuleAction,
    RuleEvaluationMode,
    RuleOperator,
    ValidationType,
)


@dataclass(frozen=True)
class FieldState:
    hidden: bool
    required: bool
    disabled: bool
    read_only: bool
    value: object = None


class RuleConfigurationError(Exception):
    pass


class RuleEngine:
    @staticmethod
    def empty(value):
        return value in (None, '', [], {})

    @classmethod
    def test(cls, operator, value, comparison):
        """Evaluate only the selected operator.

        The previous dictionary expression eagerly evaluated every comparison,
        allowing an unrelated TypeError to make a valid rule return False.
        """
        try:
            if operator == RuleOperator.EQUALS:
                return value == comparison
            if operator == RuleOperator.NOT_EQUALS:
                return value != comparison
            if operator == RuleOperator.IS_EMPTY:
                return cls.empty(value)
            if operator == RuleOperator.IS_NOT_EMPTY:
                return not cls.empty(value)
            if operator == RuleOperator.TRUTHY:
                return bool(value)
            if operator == RuleOperator.FALSY:
                return not bool(value)
            if operator == RuleOperator.IN:
                return value in (comparison or [])
            if operator == RuleOperator.NOT_IN:
                return value not in (comparison or [])
            if operator == RuleOperator.CONTAINS:
                return comparison in value
            if operator == RuleOperator.REGEX:
                return isinstance(value, str) and bool(
                    re.fullmatch(str(comparison or ''), value)
                )
            if operator == RuleOperator.GT:
                return value > comparison
            if operator == RuleOperator.GTE:
                return value >= comparison
            if operator == RuleOperator.LT:
                return value < comparison
            if operator == RuleOperator.LTE:
                return value <= comparison
            return False
        except (TypeError, ValueError, re.error):
            return False

    @classmethod
    def resolve(cls, form, values):
        fields = list(form.fields.filter(is_active=True))
        states = {
            field.id: FieldState(
                field.hidden,
                field.required,
                field.disabled,
                field.read_only,
                values.get(field.id, field.default_value),
            )
            for field in fields
        }

        groups = (
            form.rule_groups.filter(is_active=True)
            .prefetch_related('rules', 'actions')
            .order_by('priority', 'id')
        )
        for group in groups:
            rules = list(group.rules.filter(is_active=True))
            if not rules:
                continue

            checks = []
            for rule in rules:
                source = states.get(rule.source_field_id)
                if source is None:
                    raise RuleConfigurationError(
                        f'Rule {rule.pk} references an inactive or foreign source field.'
                    )
                checks.append(cls.test(rule.operator, source.value, rule.comparison_value))

            matched = all(checks) if group.evaluation_mode == RuleEvaluationMode.ALL else any(checks)
            if not matched:
                continue

            for action in group.actions.filter(is_active=True).order_by('order', 'id'):
                state = states.get(action.target_field_id)
                if state is None:
                    raise RuleConfigurationError(
                        f'Action {action.pk} references an inactive or foreign target field.'
                    )
                changes = {}
                if action.action_type == RuleAction.SHOW:
                    changes['hidden'] = False
                elif action.action_type == RuleAction.HIDE:
                    changes.update(hidden=True, required=False, value=None)
                elif action.action_type == RuleAction.REQUIRE:
                    changes['required'] = True
                elif action.action_type == RuleAction.OPTIONAL:
                    changes['required'] = False
                elif action.action_type == RuleAction.ENABLE:
                    changes['disabled'] = False
                elif action.action_type == RuleAction.DISABLE:
                    changes.update(disabled=True, value=None)
                elif action.action_type == RuleAction.SET_VALUE:
                    changes['value'] = action.action_value
                elif action.action_type == RuleAction.CLEAR_VALUE:
                    changes['value'] = None
                states[action.target_field_id] = replace(state, **changes)

        return states


class ValidationEngine:
    @staticmethod
    def _config(rule):
        value = rule.validation_value
        return value if isinstance(value, dict) else {}

    @classmethod
    def validate(cls, form, values):
        states = RuleEngine.resolve(form, values)
        errors = {}
        fields = form.fields.filter(is_active=True).prefetch_related(
            'options', 'validation_rules'
        )

        for field in fields:
            state = states[field.id]
            value = state.value
            if state.hidden or state.disabled:
                continue

            if state.required and RuleEngine.empty(value):
                errors[field.key] = field.error_message or 'This field is required.'
                continue
            if RuleEngine.empty(value):
                continue

            if field.field_type == FieldType.CHECKBOX and not isinstance(value, bool):
                errors[field.key] = 'A boolean value is required.'
                continue
            if field.field_type == FieldType.MULTISELECT and not isinstance(value, list):
                errors[field.key] = 'A list is required.'
                continue

            allowed = {option.value for option in field.options.all() if option.is_active}
            submitted = value if isinstance(value, list) else [value]
            if allowed and any(str(item) not in allowed for item in submitted):
                errors[field.key] = 'Invalid option value.'
                continue

            if field.min_length is not None and (
                not hasattr(value, '__len__') or len(value) < field.min_length
            ):
                errors[field.key] = field.error_message or f'Minimum length is {field.min_length}.'
                continue
            if field.max_length is not None and (
                not hasattr(value, '__len__') or len(value) > field.max_length
            ):
                errors[field.key] = field.error_message or f'Maximum length is {field.max_length}.'
                continue
            if field.max_selected_items is not None and isinstance(value, list) and len(value) > field.max_selected_items:
                errors[field.key] = field.error_message or f'Select no more than {field.max_selected_items} items.'
                continue
            if field.regex_pattern:
                try:
                    if not isinstance(value, str) or not re.fullmatch(field.regex_pattern, value):
                        errors[field.key] = field.error_message or 'Invalid format.'
                        continue
                except re.error:
                    errors[field.key] = 'The configured regular expression is invalid.'
                    continue

            for rule in field.validation_rules.filter(is_active=True).order_by('order', 'id'):
                config = cls._config(rule)
                valid = True

                if rule.validation_type == ValidationType.REQUIRED:
                    valid = not RuleEngine.empty(value)
                elif rule.validation_type == ValidationType.MIN_LENGTH:
                    valid = hasattr(value, '__len__') and len(value) >= int(config.get('length', 0))
                elif rule.validation_type == ValidationType.MAX_LENGTH:
                    valid = hasattr(value, '__len__') and len(value) <= int(config.get('length', 0))
                elif rule.validation_type == ValidationType.EMAIL:
                    try:
                        validate_email(value)
                    except (ValidationError, TypeError):
                        valid = False
                elif rule.validation_type == ValidationType.REGEX:
                    try:
                        valid = isinstance(value, str) and bool(
                            re.fullmatch(str(config.get('pattern', '')), value)
                        )
                    except re.error:
                        valid = False
                elif rule.validation_type == ValidationType.MUST_MATCH_FIELD:
                    other_id = config.get('field_id')
                    valid = other_id in states and value == states[other_id].value
                elif rule.validation_type == ValidationType.UNIQUE:
                    # Scope uniqueness to the same form and field.
                    valid = not field.submitted_values.filter(
                        submission__form=form,
                        value=value,
                    ).exists()
                elif rule.validation_type == ValidationType.CUSTOM:
                    # Custom executable validation is intentionally unsupported here.
                    valid = False

                if not valid:
                    errors[field.key] = rule.error_message or 'Invalid value.'
                    break

        return errors, states


class RoutingEngine:
    @classmethod
    def resolve(cls, form, values):
        matches = []
        rules = form.routing_rules.filter(is_active=True).order_by('-priority', 'id')
        for rule in rules:
            fixed = {
                rule.platform_field_key: rule.platform,
                rule.domain_field_key: rule.domain,
                rule.environment_field_key: rule.environment,
                rule.mainframe_access_type_field_key: rule.mainframe_access_type,
                rule.company_field_key: rule.company,
            }
            fixed_match = all(
                not wanted or values.get(key) == wanted
                for key, wanted in fixed.items()
                if key
            )
            conditions = rule.conditions if isinstance(rule.conditions, dict) else {}
            conditional_match = all(
                isinstance(config, dict)
                and RuleEngine.test(
                    config.get('operator', RuleOperator.EQUALS),
                    values.get(key),
                    config.get('value'),
                )
                for key, config in conditions.items()
            )
            if fixed_match and conditional_match:
                matches.append(rule)

        output = {
            'route_identifier': None,
            'fulfillment_group': None,
            'control_group': None,
            'organization': None,
        }
        for key in output:
            candidates = {getattr(rule, key) for rule in matches if getattr(rule, key)}
            if len(candidates) > 1:
                raise RuleConfigurationError(f'Conflicting routing results for {key}')
            if candidates:
                output[key] = candidates.pop()
        return output



def rule_detail(request, pk):
    rule = get_object_or_404(
        RuleGroup.objects.prefetch_related(
            "rules",
            "actions",
        ),
        pk=pk,
    )

    return render(
        request,
        "gdx_admin/apps/dar/rules/rule_detail.html",
        {
            "rule": rule,
        },
    )