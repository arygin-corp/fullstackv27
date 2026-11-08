"""Fill created, updated, and publish timestamps when a model is saved."""
from django.db import models
from django.db.models.signals import pre_save
from django.utils import timezone


STAMP_IF_EMPTY = {"publish_at", "created_at"}
STAMP_EVERY_SAVE = {"updated_at"}


def _moment(field):
    if isinstance(field, models.DateTimeField):
        return timezone.localtime()
    if isinstance(field, models.DateField):
        return timezone.localdate()
    return None


def stamp_model_times(sender, instance, raw=False, **kwargs):
    if raw or not hasattr(sender, "_meta"):
        return
    creating = instance._state.adding
    for field in instance._meta.concrete_fields:
        if getattr(field, "auto_now", False) or getattr(field, "auto_now_add", False):
            continue
        moment = _moment(field)
        if moment is None:
            continue
        current = getattr(instance, field.attname)
        if field.name in STAMP_EVERY_SAVE:
            setattr(instance, field.attname, moment)
        elif field.name in STAMP_IF_EMPTY and current is None and (field.name != "created_at" or creating):
            setattr(instance, field.attname, moment)


def _prefill_form(form_class):
    if getattr(form_class, "_autostamp", False):
        return form_class
    original_init = form_class.__init__

    def __init__(self, *args, **kwargs):
        original_init(self, *args, **kwargs)
        for name in ("publish_at", "created_at", "updated_at"):
            field = self.fields.get(name)
            if field is None or self.initial.get(name):
                continue
            model_field = self._meta.model._meta.get_field(name)
            moment = _moment(model_field)
            if moment is None:
                continue
            self.initial[name] = moment
            field.initial = moment

    form_class.__init__ = __init__
    form_class._autostamp = True
    return form_class


def install_admin_prefill():
    from django.contrib.admin import ModelAdmin

    if getattr(ModelAdmin.get_form, "_autostamp", False):
        return
    original_get_form = ModelAdmin.get_form

    def get_form(self, request, obj=None, change=False, **kwargs):
        form = original_get_form(self, request, obj, change=change, **kwargs)
        return _prefill_form(form)

    get_form._autostamp = True
    ModelAdmin.get_form = get_form


def connect_autostamp():
    pre_save.connect(stamp_model_times, dispatch_uid="apps.marketplace.autostamp")
    install_admin_prefill()
