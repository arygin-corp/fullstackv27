from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from django.forms.models import model_to_dict

from .models import AuditLog

SENSITIVE_FIELDS = {
    "password", "token", "access_token", "refresh_token", "secret",
    "api_key", "authorization",
}


def normalize(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (date, datetime, Decimal, UUID)):
        return str(value)
    if hasattr(value, "pk"):
        return value.pk
    if isinstance(value, dict):
        return {str(key): normalize(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [normalize(item) for item in value]
    return str(value)


def serialize_instance(instance):
    data = model_to_dict(instance)
    for field_name in ("created_at", "updated_at", "published_at"):
        if hasattr(instance, field_name):
            data[field_name] = getattr(instance, field_name)
    return {
        key: "[REDACTED]" if key.lower() in SENSITIVE_FIELDS else normalize(value)
        for key, value in data.items()
    }


def changes(before, after):
    return {
        key: {"from": before.get(key), "to": after.get(key)}
        for key in sorted(set(before) | set(after))
        if before.get(key) != after.get(key)
    }


def request_metadata(request):
    if request is None:
        return {
            "actor": None, "actor_username": "system", "actor_email": "",
            "request_path": "", "request_method": "", "ip_address": None,
            "user_agent": "",
        }
    user = getattr(request, "user", None)
    actor = user if user is not None and user.is_authenticated else None
    return {
        "actor": actor,
        "actor_username": actor.get_username() if actor else "anonymous",
        "actor_email": getattr(actor, "email", "") if actor else "",
        "request_path": str(getattr(request, "path", ""))[:500],
        "request_method": str(getattr(request, "method", ""))[:10],
        "ip_address": request.META.get("REMOTE_ADDR"),
        "user_agent": request.META.get("HTTP_USER_AGENT", ""),
    }


def log_event(*, request, action, instance, before=None, after=None, identity=None):
    before, after = before or {}, after or {}
    identity = identity or {
        "model_name": instance._meta.label_lower,
        "object_id": str(instance.pk),
        "object_repr": str(instance)[:255],
    }
    return AuditLog.objects.create(
        action=action, changes=changes(before, after), snapshot=after or before,
        **identity, **request_metadata(request),
    )
