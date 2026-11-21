import json
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models.signals import post_save, pre_delete, pre_save
from .audit_context import get_audit_context
from .models import FormDefinition, FormSection, FormField, FieldOption, RuleGroup, FieldRule, FieldAction, ValidationRule, RoutingRule, FormChangeLog
TRACKED = (FormDefinition, FormSection, FormField, FieldOption, RuleGroup, FieldRule, FieldAction, ValidationRule, RoutingRule)

def snap(o):
    return {f.name: json.loads(json.dumps(f.value_from_object(o), cls=DjangoJSONEncoder)) for f in o._meta.concrete_fields}

def calculate_changes(before, after):
    before = before or {}
    after = after or {}
    return {
        name: {'before': before.get(name), 'after': after.get(name)}
        for name in before.keys() | after.keys()
        if before.get(name) != after.get(name)
    }

def write(o, action, before, after):
    changed_fields = calculate_changes(before, after)
    if action == 'update' and not changed_fields:
        return
    c = get_audit_context()
    actor = (c.actor if c else None) or getattr(o, 'updated_by', None) or getattr(o, 'created_by', None)
    form_id = o.pk if isinstance(o, FormDefinition) else getattr(o, 'form_id', None)
    FormChangeLog.objects.create(form_id=form_id, object_app_label=o._meta.app_label, object_model=o._meta.model_name, object_pk=str(o.pk), object_repr=str(o)[:500], action=action, changed_fields=changed_fields, before=before, after=after, actor=actor, actor_label=str(actor or '')[:255], source=c.source if c else 'system', request_id=c.request_id if c else '', request_method=c.request_method if c else '', request_path=c.request_path if c else '', change_reason=c.change_reason if c else '')

def before(sender, instance, raw=False, **k):
    instance._before = None if raw or instance._state.adding else snap(sender.objects.get(pk=instance.pk))

def after(sender, instance, created=False, raw=False, **k):
    if not raw:
        write(instance, 'create' if created else 'update', None if created else getattr(instance, '_before', None), snap(instance))

def deleting(sender, instance, **k):
    write(instance, 'delete', snap(instance), None)

def register_audit_signals():
    for m in TRACKED:
        pre_save.connect(before, sender=m, weak=False, dispatch_uid=f'{m._meta.label_lower}.audit.before')
        post_save.connect(after, sender=m, weak=False, dispatch_uid=f'{m._meta.label_lower}.audit.after')
        pre_delete.connect(deleting, sender=m, weak=False, dispatch_uid=f'{m._meta.label_lower}.audit.delete')
