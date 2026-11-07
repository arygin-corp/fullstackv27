import re
from dataclasses import dataclass
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from ..models import FieldType, RuleAction, RuleEvaluationMode, RuleOperator, ValidationType

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
    def empty(v):
        return v in (None, '', [], {})

    @classmethod
    def test(cls, op, v, c):
        try:
            return {RuleOperator.EQUALS: v == c, RuleOperator.NOT_EQUALS: v != c, RuleOperator.IS_EMPTY: cls.empty(v), RuleOperator.IS_NOT_EMPTY: not cls.empty(v), RuleOperator.TRUTHY: bool(v), RuleOperator.FALSY: not bool(v)}.get(op, v in (c or []) if op == RuleOperator.IN else v not in (c or []) if op == RuleOperator.NOT_IN else c in v if op == RuleOperator.CONTAINS else bool(re.fullmatch(str(c), v)) if op == RuleOperator.REGEX and isinstance(v, str) else v > c if op == RuleOperator.GT else v >= c if op == RuleOperator.GTE else v < c if op == RuleOperator.LT else v <= c if op == RuleOperator.LTE else False)
        except (TypeError, ValueError, re.error):
            return False

    @classmethod
    def resolve(cls, form, values):
        states = {f.id: FieldState(f.hidden, f.required, f.disabled, f.read_only, values.get(f.id, f.default_value)) for f in form.fields.filter(is_active=True)}
        for g in form.rule_groups.filter(is_active=True).prefetch_related('rules', 'actions').order_by('priority', 'id'):
            checks = [cls.test(r.operator, states[r.source_field_id].value, r.comparison_value) for r in g.rules.filter(is_active=True)]
            if not checks or not (all(checks) if g.evaluation_mode == RuleEvaluationMode.ALL else any(checks)):
                continue
            for a in g.actions.filter(is_active=True).order_by('order', 'id'):
                s = states[a.target_field_id]
                d = s.__dict__.copy()
                if a.action_type == RuleAction.SHOW:
                    d['hidden'] = False
                elif a.action_type == RuleAction.HIDE:
                    d.update(hidden=True, required=False, value=None)
                elif a.action_type == RuleAction.REQUIRE:
                    d['required'] = True
                elif a.action_type == RuleAction.OPTIONAL:
                    d['required'] = False
                elif a.action_type == RuleAction.ENABLE:
                    d['disabled'] = False
                elif a.action_type == RuleAction.DISABLE:
                    d.update(disabled=True, value=None)
                elif a.action_type == RuleAction.SET_VALUE:
                    d['value'] = a.action_value
                elif a.action_type == RuleAction.CLEAR_VALUE:
                    d['value'] = None
                states[a.target_field_id] = FieldState(**d)
        return states

class ValidationEngine:

    @classmethod
    def validate(cls, form, values):
        states = RuleEngine.resolve(form, values)
        errors = {}
        for f in form.fields.filter(is_active=True).prefetch_related('options', 'validation_rules'):
            s = states[f.id]
            v = s.value
            if s.hidden or s.disabled:
                continue
            if s.required and RuleEngine.empty(v):
                errors[f.key] = f.error_message or 'This field is required.'
                continue
            if RuleEngine.empty(v):
                continue
            if f.field_type == FieldType.CHECKBOX and (not isinstance(v, bool)):
                errors[f.key] = 'A boolean value is required.'
                continue
            if f.field_type == FieldType.MULTISELECT and (not isinstance(v, list)):
                errors[f.key] = 'A list is required.'
                continue
            allowed = {o.value for o in f.options.all() if o.is_active}
            submitted = v if isinstance(v, list) else [v]
            if allowed and any((str(x) not in allowed for x in submitted)):
                errors[f.key] = 'Invalid option value.'
                continue
            for r in f.validation_rules.filter(is_active=True):
                cfg = r.validation_value or {}
                ok = True
                if r.validation_type == ValidationType.MIN_LENGTH:
                    ok = hasattr(v, '__len__') and len(v) >= int(cfg.get('length', 0))
                elif r.validation_type == ValidationType.MAX_LENGTH:
                    ok = hasattr(v, '__len__') and len(v) <= int(cfg.get('length', 0))
                elif r.validation_type == ValidationType.EMAIL:
                    try:
                        validate_email(v)
                    except (ValidationError, TypeError):
                        ok = False
                elif r.validation_type == ValidationType.REGEX:
                    try:
                        ok = isinstance(v, str) and bool(re.fullmatch(cfg.get('pattern', ''), v))
                    except re.error:
                        ok = False
                if not ok:
                    errors[f.key] = r.error_message
                    break
        return (errors, states)

class RoutingEngine:

    @classmethod
    def resolve(cls, form, values):
        rows = []
        for r in form.routing_rules.filter(is_active=True).order_by('-priority', 'id'):
            fixed = {r.platform_field_key: r.platform, r.domain_field_key: r.domain, r.environment_field_key: r.environment, r.mainframe_access_type_field_key: r.mainframe_access_type, r.company_field_key: r.company}
            if all((not wanted or values.get(key) == wanted for key, wanted in fixed.items() if key)) and all((RuleEngine.test(cfg.get('operator', RuleOperator.EQUALS), values.get(key), cfg.get('value')) for key, cfg in (r.conditions or {}).items())):
                rows.append(r)
        out = {'route_identifier': None, 'fulfillment_group': None, 'control_group': None, 'organization': None}
        for key in out:
            vals = {getattr(r, key) for r in rows if getattr(r, key)}
            if len(vals) > 1:
                raise RuleConfigurationError(f'Conflicting routing results for {key}')
            if vals:
                out[key] = vals.pop()
        return out
