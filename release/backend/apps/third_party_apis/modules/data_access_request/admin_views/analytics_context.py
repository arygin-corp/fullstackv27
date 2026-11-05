"""DAR + Orders analytics context builder.

Confirmed DAR template-facing fields from the existing project:
request_number, pk, form, status/get_status_display, submitted_by, created_at.

The Orders model/field definitions were not available in the retrieved source, so the
Orders mapping below is explicit configuration rather than a guessed hard-coded model.
Replace ORDER_MODEL and ORDER_FIELD_MAP with the actual Orders app model and fields.
"""
from collections import defaultdict
from django.apps import apps
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.urls import reverse

DAR_MODEL = ("dar", "Submission")
ORDER_MODEL = ("orders", "Order")

DAR_FIELD_MAP = {
    "id": "request_number",
    "title": "form",
    "status": "status",
    "requester": "submitted_by",
    "created": "created_at",
}

# Configure after verifying orders/models.py.
ORDER_FIELD_MAP = {
    "id": "pk",
    "title": "product",       # replace if your field differs
    "status": "status",      # replace if your field differs
    "requester": "user",     # replace if your field differs
    "created": "created_at", # replace if your field differs
}
COMPLETED_STATUSES = {"completed", "fulfilled", "closed", "approved"}


def _value(obj, field_name, default=""):
    value = getattr(obj, field_name, default)
    return value() if callable(value) else value


def _status_label(obj, field_name):
    display = getattr(obj, f"get_{field_name}_display", None)
    return display() if callable(display) else str(_value(obj, field_name, ""))


def _metrics(queryset, mapping):
    total = queryset.count()
    raw = list(queryset.values(mapping["status"]).annotate(total=Count("pk")).order_by(mapping["status"]))
    status_counts = [{"label": str(row[mapping["status"]]).replace("_", " ").title(), "total": row["total"]} for row in raw]
    completed = sum(row["total"] for row in raw if str(row[mapping["status"]]).lower() in COMPLETED_STATUSES)
    return {"total": total, "completed": completed, "open": total - completed, "status_counts": status_counts}


def _monthly(queryset, created_field):
    return {row["month"]: row["total"] for row in queryset.annotate(month=TruncMonth(created_field)).values("month").annotate(total=Count("pk")).order_by("month") if row["month"]}


def _recent(queryset, mapping, source, detail_name):
    rows = []
    for obj in queryset.order_by(f'-{mapping["created"]}')[:10]:
        raw_id = _value(obj, mapping["id"], obj.pk)
        rows.append({
            "source": source,
            "request_id": raw_id,
            "title": str(_value(obj, mapping["title"], raw_id)),
            "status": _status_label(obj, mapping["status"]),
            "requester": str(_value(obj, mapping["requester"], "System")),
            "created_at": _value(obj, mapping["created"], None),
            "detail_url": reverse(detail_name, kwargs={"pk": obj.pk}),
        })
    return rows


def build_request_source_context(*, dar_detail_name="dar:submission-detail", order_detail_name="orders:order-detail"):
    DarSubmission = apps.get_model(*DAR_MODEL)
    Order = apps.get_model(*ORDER_MODEL)
    dar_qs = DarSubmission.objects.all()
    product_qs = Order.objects.all()

    dar_metrics = _metrics(dar_qs, DAR_FIELD_MAP)
    product_metrics = _metrics(product_qs, ORDER_FIELD_MAP)
    total = dar_metrics["total"] + product_metrics["total"]
    combined = {
        "total": total,
        "completed": dar_metrics["completed"] + product_metrics["completed"],
        "dar_percentage": round((dar_metrics["total"] / total) * 100, 1) if total else 0,
        "product_percentage": round((product_metrics["total"] / total) * 100, 1) if total else 0,
    }

    dar_months = _monthly(dar_qs, DAR_FIELD_MAP["created"])
    product_months = _monthly(product_qs, ORDER_FIELD_MAP["created"])
    monthly_sources = [{"label": month.strftime("%b %Y"), "dar_total": dar_months.get(month, 0), "product_total": product_months.get(month, 0), "total": dar_months.get(month, 0) + product_months.get(month, 0)} for month in sorted(set(dar_months) | set(product_months))]

    recent = _recent(dar_qs, DAR_FIELD_MAP, "dar", dar_detail_name) + _recent(product_qs, ORDER_FIELD_MAP, "product", order_detail_name)
    recent.sort(key=lambda item: item["created_at"] or 0, reverse=True)
    return {"dar_metrics": dar_metrics, "product_metrics": product_metrics, "combined_metrics": combined, "monthly_sources": monthly_sources, "recent_requests": recent[:20]}


def apply_date_range(queryset, created_field, start=None, end=None):
    if start:
        queryset = queryset.filter(**{f"{created_field}__date__gte": start})
    if end:
        queryset = queryset.filter(**{f"{created_field}__date__lte": end})
    return queryset