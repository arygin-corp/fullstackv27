import json

from django.db.models import Count, Q
from django.utils import timezone

from apps.orders.models import Request, SyncCursor

from .models import Product

CURSOR_NAME = "campaign-most-requested"
TOP_LIMIT = 20
REFRESH_AFTER_ORDERS = 100


def most_requested_product_ids():
    """Top published products by submitted order history.

    The ranking is stored and reused until 100 new product orders
    have been submitted since the last calculation.
    """
    snapshot = _snapshot()
    watermark = int(snapshot.get("request_id") or 0) if snapshot else 0
    if snapshot and _new_product_orders(watermark) < REFRESH_AFTER_ORDERS:
        return snapshot.get("product_ids") or []

    product_ids = _calculate()
    latest_id = (
        Request.objects.order_by("-id").values_list("id", flat=True).first()
        or 0
    )
    SyncCursor.objects.update_or_create(
        name=CURSOR_NAME,
        defaults={
            "cursor": json.dumps({
                "request_id": latest_id,
                "product_ids": product_ids,
            }),
            "last_completed_at": timezone.now(),
            "last_status": "CALCULATED",
        },
    )
    return product_ids


def _snapshot():
    cursor = SyncCursor.objects.filter(name=CURSOR_NAME).only("cursor").first()
    if not cursor or not cursor.cursor:
        return None
    try:
        payload = json.loads(cursor.cursor)
    except (TypeError, ValueError):
        return None
    if not isinstance(payload, dict):
        return None
    return payload


def _new_product_orders(watermark):
    return (
        Request.objects.filter(id__gt=watermark)
        .exclude(Q(product_id__isnull=True) | Q(product_id=""))
        .count()
    )


def _calculate():
    totals = (
        Request.objects.exclude(Q(product_id__isnull=True) | Q(product_id=""))
        .values("product_id")
        .annotate(total=Count("id"))
        .order_by("-total", "product_id")
    )
    by_id = {}
    by_slug = {}
    for row in totals:
        key = str(row["product_id"]).strip()
        if not key:
            continue
        if key.isdigit():
            by_id[int(key)] = row["total"]
        else:
            by_slug[key] = row["total"]
    if not by_id and not by_slug:
        return []

    products = Product.objects.published().filter(
        Q(id__in=by_id.keys()) | Q(slug__in=by_slug.keys())
    ).only("id", "slug")
    scored = []
    for product in products:
        score = by_id.get(product.id, 0) + by_slug.get(product.slug or "", 0)
        if score:
            scored.append((score, product.id))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [product_id for _, product_id in scored[:TOP_LIMIT]]
