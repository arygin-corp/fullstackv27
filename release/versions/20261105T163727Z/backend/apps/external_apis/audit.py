import logging
from typing import Any

from django.contrib.auth.models import AnonymousUser

from .models import APIRequestAudit

logger = logging.getLogger(__name__)
SENSITIVE_PARTS = (
    "authorization", "cookie", "password", "secret", "token",
    "api_key", "api-key", "x-api-key", "client_secret",
)


def sanitize(value: Any, sensitive_keys=()):
    sensitive = {str(key).casefold() for key in sensitive_keys}
    if isinstance(value, dict):
        return {
            str(key): "********"
            if str(key).casefold() in sensitive or any(part in str(key).lower() for part in SENSITIVE_PARTS)
            else sanitize(item, sensitive)
            for key, item in value.items()
        }
    if isinstance(value, (list, tuple)):
        return [sanitize(item, sensitive_keys) for item in value]
    return value


def create_api_audit(*, request=None, exception=None, sensitive_keys=(), **fields):
    """Best-effort immutable audit write that cannot mask the original error."""
    try:
        if request is not None:
            user = getattr(request, "user", None)
            if isinstance(user, AnonymousUser) or not getattr(user, "is_authenticated", False):
                user = None
            claims = {}
            if isinstance(getattr(request, "auth", None), dict):
                claims.update(request.auth)
            if isinstance(getattr(request, "msal_claims", None), dict):
                claims.update(request.msal_claims)
            fields.setdefault("user", user)
            fields.setdefault("frontend_application", getattr(request, "frontend_application", None))
            fields.setdefault("api_key", getattr(request, "external_api_key", None))
            fields.setdefault("published_endpoint", getattr(request, "published_endpoint", None))
            fields.setdefault("client_ip", request.META.get("REMOTE_ADDR"))
            fields.setdefault("user_object_id", str(claims.get("oid", ""))[:255])
            fields.setdefault(
                "user_principal_name",
                str(
                    claims.get("preferred_username")
                    or claims.get("upn")
                    or getattr(user, "email", "")
                    or ""
                )[:255],
            )
            fields.setdefault("origin", request.headers.get("Origin", "")[:500])
            fields.setdefault("method", request.method[:10])
            fields.setdefault("request_path", request.path[:1000])
        fields["request_parameters"] = sanitize(fields.get("request_parameters", {}), sensitive_keys)
        if exception is not None:
            fields.setdefault("exception_type", type(exception).__name__[:255])
            fields.setdefault("error_message", str(exception)[:4000])
        return APIRequestAudit.objects.create(**fields)
    except Exception:
        logger.exception("Unable to persist API audit record")
        return None
