from uuid import uuid4

from .models import ProductIntakeAuditLog

AUDITED_FIELDS = (
    "product_name", "product_desc", "product_type", "product_url", "product_domain",
    "stakeholder_name", "product_pii", "product_spi", "pii_explanation",
    "requester_first_name", "requester_last_name", "requester_email",
    "submitted_by_first_name", "submitted_by_last_name", "submitted_by_email",
    "status", "assigned_to_id", "rejection_reason", "rejection_comments",
    "approval_reason", "marketplace_product_id", "is_active",
)
REDACTED_FIELDS = {"product_desc", "pii_explanation", "rejection_comments", "approval_reason"}


def request_metadata(request):
    if request is None:
        return {"request_id": str(uuid4()), "request_method": "", "request_path": "", "ip_address": None}
    return {
        "request_id": request.headers.get("X-Request-ID") or str(uuid4()),
        "request_method": request.method,
        "request_path": request.path[:500],
        "ip_address": request.META.get("REMOTE_ADDR"),
    }


def snapshot(intake):
    data = {field: getattr(intake, field, None) for field in AUDITED_FIELDS}
    data["product_tags"] = sorted(intake.product_tags.values_list("id", flat=True)) if intake.pk else []
    data["samples"] = [
        {"field": getattr(intake, f"sample_field{i}"), "value": getattr(intake, f"sample_value{i}")}
        for i in range(1, 11)
    ]
    return data


def write_audit(*, intake, action, actor, request=None, before=None):
    after = snapshot(intake)
    changes = {}
    for field in sorted(set(before or {}) | set(after)):
        old, new = (before or {}).get(field), after.get(field)
        if old == new:
            continue
        if field in REDACTED_FIELDS or field == "samples":
            changes[field] = {"changed": True, "values_redacted": True}
        else:
            changes[field] = {"old": old, "new": new}
    return ProductIntakeAuditLog.objects.create(
        intake=intake,
        action=action,
        changed_fields=list(changes),
        changes=changes,
        actor=actor if actor and actor.is_authenticated else None,
        actor_email=(getattr(actor, "email", "") or "").strip().casefold(),
        **request_metadata(request),
    )
