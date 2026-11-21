from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver
from .audit import log_event, serialize_instance
from .audit_context import get_request
from .models import AuditLog, Categorie, Post

AUDITED = (Post, Categorie)

@receiver(pre_save)
def capture_before_save(sender, instance, **kwargs):
    if sender not in AUDITED: return
    instance._audit_before = {}
    if instance.pk:
        try: instance._audit_before = serialize_instance(sender.objects.get(pk=instance.pk))
        except sender.DoesNotExist: pass

@receiver(post_save)
def audit_save(sender, instance, created, raw=False, **kwargs):
    if sender not in AUDITED or raw: return
    log_event(request=get_request(), action=AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE,
              instance=instance, before=getattr(instance, "_audit_before", {}), after=serialize_instance(instance))

@receiver(pre_delete)
def capture_before_delete(sender, instance, **kwargs):
    if sender not in AUDITED: return
    instance._audit_before_delete = serialize_instance(instance)
    instance._audit_identity = {"model_name": instance._meta.label_lower, "object_id": str(instance.pk), "object_repr": str(instance)[:255]}

@receiver(post_delete)
def audit_delete(sender, instance, **kwargs):
    if sender not in AUDITED: return
    log_event(request=get_request(), action=AuditLog.Action.DELETE, instance=instance,
              before=getattr(instance, "_audit_before_delete", {}), identity=getattr(instance, "_audit_identity", None))
