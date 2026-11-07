"""Operational numbers for Command Center analytics. Each area reads records GDX already stores."""

import json
from datetime import datetime, timedelta
from pathlib import Path

from django.db.models import Count, Min, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone


def with_share(rows):
    total = sum(row["value"] for row in rows)
    shared = []
    for row in rows:
        share = round(row["value"] * 100 / total) if total else 0
        shared.append({**row, "share": share, "bar": True})
    return shared


def choice_rows(grouped, choices):
    return with_share([
        {"label": label, "value": int(grouped.get(value, 0) or 0)}
        for value, label in choices
    ])


def age_label(oldest, now):
    if oldest is None:
        return "None waiting"
    seconds = max((now - oldest).total_seconds(), 0)
    days = int(seconds // 86400)
    if days >= 1:
        return f"{days} days"
    hours = max(int(seconds // 3600), 0)
    return f"{hours} hours"


def duration_label(milliseconds):
    milliseconds = int(milliseconds or 0)
    if milliseconds < 1000:
        return f"{milliseconds} ms"
    seconds = milliseconds / 1000
    if seconds < 60:
        return f"{seconds:.1f} s"
    return f"{seconds / 60:.1f} min"


CHARTS = {
    "Products by status": ("column", False),
    "Products added": ("column", True),
    "Top domains": ("bar", False),
    "Most common searches": ("bar", False),
    "Data-access submissions": ("column", False),
    "Forms with the most submissions": ("bar", False),
    "Checkout": ("bar", False),
    "Orders opened": ("column", True),
    "Approval stage": ("bar", False),
    "RITM state": ("bar", False),
    "ServiceNow sync": ("column", False),
    "Latest sync failures": ("list", False),
    "Open tasks by assignment group": ("bar", False),
    "Deliveries": ("area", True),
    "Channel health": ("bar", False),
    "Campaigns sending": ("list", False),
    "Integration requests": ("line", True),
    "Modules with failures": ("bar", False),
    "Platform health": ("list", False),
    "Running release": ("list", False),
    "Builds by target": ("column", False),
    "Builds by environment": ("bar", False),
    "Google Analytics": ("column", False),
    "Accounts by access role": ("bar", False),
    "Content pages by type": ("column", False),
    "Page versions": ("bar", False),
}

RANGE_OPTIONS = (
    ("7d", "7 days"),
    ("14d", "14 days"),
    ("30d", "30 days"),
    ("90d", "90 days"),
    ("12m", "12 months"),
    ("all", "All"),
)
RANGE_IDS = {item[0] for item in RANGE_OPTIONS}
RANGE_DAYS = {"7d": 7, "14d": 14, "30d": 30, "90d": 90, "12m": 365}


def chosen(params, name, default):
    value = ""
    if params is not None:
        value = params.get(name) or ""
    if value not in RANGE_IDS:
        return default
    return value


def series_chart(spec):
    if spec in ("7d", "14d", "30d"):
        return "line"
    return "column"


def range_start(spec, now):
    days = RANGE_DAYS.get(spec)
    if not days:
        return None
    return now - timedelta(days=days - 1)


def limit_qs(qs, field, spec, now, as_date=False):
    start = range_start(spec, now)
    if start is None:
        return qs
    value = timezone.localdate() - timedelta(days=RANGE_DAYS[spec] - 1) if as_date else start
    return qs.filter(**{f"{field}__gte": value})


def date_filter(params, name, default):
    return {
        "name": name,
        "selected": chosen(params, name, default),
        "options": [{"id": key, "label": label} for key, label in RANGE_OPTIONS],
    }


def select_filter(params, name, default, options):
    allowed = {item[0] for item in options}
    value = params.get(name) if params is not None else None
    if value not in allowed:
        value = default
    return {
        "name": name,
        "selected": value,
        "options": [{"id": key, "label": label} for key, label in options],
    }


def _style(section):
    if not section:
        return section
    for item in section.get("columns") or []:
        kind, wide = CHARTS.get(item.get("title"), ("bar", False))
        item.setdefault("chart", kind)
        if item.get("time") and item["chart"] in ("column", "area", "line"):
            item["wide"] = len(item.get("rows") or []) >= 6
        else:
            item.setdefault("wide", wide)
        item.setdefault("empty", "")
        item.setdefault("note", "")
        item.setdefault("filters", [])
        item.setdefault("filter_names", [])
        item.setdefault("refresh", True)
    return section


def google_column(connection):
    property_id = connection.get("property_id") or ""
    summary = connection.get("summary") if isinstance(connection.get("summary"), dict) else {}
    if not connection.get("connected"):
        return {
            "title": "Google Analytics",
            "rows": [],
            "chart": "list",
            "empty": "No property is connected.",
            "note": "",
        }
    if not summary:
        return {
            "title": "Google Analytics",
            "rows": [],
            "chart": "list",
            "empty": f"Property {property_id} is connected. The last 7 days appear after Test connection.",
            "note": "",
        }
    return {
        "title": "Google Analytics",
        "chart": "column",
        "rows": [
            {"label": "Visitors", "value": int(summary.get("active_users") or 0), "bar": False},
            {"label": "Sessions", "value": int(summary.get("sessions") or 0), "bar": False},
            {"label": "Page views", "value": int(summary.get("page_views") or 0), "bar": False},
        ],
        "empty": "",
        "note": "Last 7 days from the saved connection test.",
    }


def _counts(model, field):
    return _counts_qs(model.objects.all(), field)


def _counts_qs(queryset, field):
    grouped = {}
    for row in queryset.values(field).annotate(total=Count("id")):
        grouped[row[field]] = row["total"]
    return grouped


def _filters(*items):
    filters = [item for item in items if item]
    return {"filters": filters, "filter_names": [item["name"] for item in filters], "refresh": True}


def _section(title, builder):
    try:
        return builder()
    except Exception as exc:
        return {
            "title": title,
            "stats": [],
            "columns": [],
            "note": f"This area could not be read ({exc.__class__.__name__}).",
        }


def _month_rows(queryset, field):
    rows = (
        queryset.exclude(**{f"{field}__isnull": True})
        .annotate(month=TruncMonth(field))
        .values("month")
        .annotate(total=Count("id"))
        .order_by("month")
    )
    shaped = [
        {"label": row["month"].strftime("%b %Y"), "value": row["total"]}
        for row in rows
        if row["month"]
    ]
    return with_share(shaped[-12:])


def _top(queryset, field, label_for, limit=6):
    rows = []
    for row in queryset.values(field).annotate(total=Count("id")).order_by("-total")[:limit]:
        label = label_for(row[field])
        if label:
            rows.append({"label": label, "value": row["total"]})
    return with_share(rows)


def _version_pair(path):
    try:
        payload = json.loads(Path(path).read_text())
    except (OSError, json.JSONDecodeError, TypeError):
        return ""
    if not isinstance(payload, dict):
        return ""
    version = str(payload.get("version") or "").strip()
    build = str(payload.get("buildId") or "").strip()
    if version and build:
        return f"{version} · {build}"
    return version or build


def _release_versions():
    from django.conf import settings

    root = Path(settings.BASE_DIR).parent
    release = root / "release"
    backend = release / "backend" / "version.json"
    frontend = release / "frontend" / "version.json"
    if not backend.is_file():
        backend = Path(settings.BASE_DIR) / "version.json"
    if not frontend.is_file():
        frontend = root / "frontend" / "src" / "assets" / "version.json"
    return [
        {"label": "Backend", "value": _version_pair(backend) or "Not recorded", "bar": False},
        {"label": "Frontend", "value": _version_pair(frontend) or "Not recorded", "bar": False},
    ]


def _marketplace(params):
    from apps.marketplace.models import (
        PRODUCT_STATUS_CHOICES,
        Product,
        SearchQueryLog,
    )

    now = timezone.now()
    added_range = chosen(params, "product_added", "12m")
    added_status = select_filter(
        params,
        "product_added_status",
        "all",
        (("all", "All statuses"),) + tuple(PRODUCT_STATUS_CHOICES),
    )
    products = Product.objects.all()
    added = limit_qs(products, "created_at", added_range, now)
    if added_status["selected"] != "all":
        added = added.filter(status=added_status["selected"])
    if added_range in ("7d", "14d", "30d"):
        added_rows, added_chart = _day_rows(added, "created_at", RANGE_DAYS[added_range]), "line"
    else:
        added_rows, added_chart = _month_rows(added, "created_at"), "column"
    status_range = chosen(params, "product_status", "all")
    domain_range = chosen(params, "domains", "all")
    search_range = chosen(params, "searches", "30d")
    return {
        "title": "Marketplace catalog",
        "stats": [
            {"label": "Personal information", "value": Product.objects.filter(pi="Yes").count()},
            {"label": "Sensitive personal information", "value": Product.objects.filter(sensitive_pi="Yes").count()},
            {"label": "Review pending", "value": Product.objects.filter(data_review_status="pending").count()},
            {"label": "No data steward", "value": Product.objects.filter(data_steward__isnull=True).count()},
            {"label": "No classification", "value": Product.objects.filter(classification__isnull=True).count()},
            {"label": "Searches with no results", "value": SearchQueryLog.objects.filter(results_count=0).count()},
        ],
        "columns": [
            {
                "title": "Products by status",
                "chart": "column",
                "rows": choice_rows(_counts_qs(limit_qs(products, "created_at", status_range, now), "status"), PRODUCT_STATUS_CHOICES),
                "empty": "No products are recorded.",
                **_filters(date_filter(params, "product_status", "all")),
            },
            {
                "title": "Products added",
                "chart": added_chart,
                "time": True,
                "rows": added_rows,
                "empty": "No products were added in this range.",
                **_filters(date_filter(params, "product_added", "12m"), added_status),
            },
            {
                "title": "Top domains",
                "chart": "bar",
                "rows": _top(limit_qs(products, "created_at", domain_range, now), "domain__name", lambda name: name or "No domain"),
                "empty": "No products are recorded.",
                **_filters(date_filter(params, "domains", "all")),
            },
            {
                "title": "Most common searches",
                "chart": "bar",
                "rows": _top(
                    limit_qs(SearchQueryLog.objects.all(), "created_at", search_range, now),
                    "query",
                    lambda query: (query or "").strip(),
                ),
                "empty": "No searches are recorded.",
                **_filters(date_filter(params, "searches", "30d")),
            },
        ],
        "note": "",
    }


def _access(params):
    from apps.forms.models import FormSubmission, SubmissionStatus
    from apps.orders.models import MarketplaceOrder, Request, SyncCursor, Task
    from apps.product_checkout.models import CheckoutStatus, ProductCheckoutRequest

    now = timezone.now()
    waiting = FormSubmission.objects.filter(status=SubmissionStatus.SUBMITTED, submitted_at__isnull=False)
    oldest = waiting.aggregate(oldest=Min("submitted_at"))["oldest"]
    week_ago = now - timedelta(days=7)
    cursor = SyncCursor.objects.exclude(last_completed_at=None).order_by("-last_completed_at").first()
    last_sync = "None completed"
    if cursor and cursor.last_completed_at:
        local = timezone.localtime(cursor.last_completed_at)
        clock = local.strftime("%I:%M %p").lstrip("0")
        last_sync = f"{local.strftime('%b')} {local.day}, {clock}"
    failure_range = chosen(params, "failures", "30d")
    failures = []
    for order in limit_qs(
        MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.FAILED),
        "updated_at",
        failure_range,
        now,
    ).order_by("-updated_at")[:5]:
        local = timezone.localtime(order.updated_at)
        failures.append({
            "label": order.marketplace_order_id,
            "value": local.strftime("%b") + f" {local.day}",
            "bar": False,
        })
    task_range = chosen(params, "tasks", "all")
    open_tasks = limit_qs(Task.objects.exclude(state__istartswith="closed"), "created_at", task_range, now)
    submission_range = chosen(params, "submissions", "30d")
    form_range = chosen(params, "forms", "30d")
    checkout_range = chosen(params, "checkout", "30d")
    order_range = chosen(params, "orders", "12m")
    order_state = select_filter(params, "orders_state", "all", (("all", "Open and closed"), ("open", "Open"), ("closed", "Closed")))
    approval_range = chosen(params, "approval", "30d")
    ritm_range = chosen(params, "ritm", "30d")
    sync_range = chosen(params, "sync", "all")
    orders = limit_qs(Request.objects.all(), "opened_at", order_range, now)
    if order_state["selected"] == "open":
        orders = orders.filter(closed_at__isnull=True)
    elif order_state["selected"] == "closed":
        orders = orders.filter(closed_at__isnull=False)
    if order_range in ("7d", "14d", "30d"):
        order_rows, order_chart = _day_rows(orders, "opened_at", RANGE_DAYS[order_range]), "line"
    else:
        order_rows, order_chart = _month_rows(orders, "opened_at"), "column"
    return {
        "title": "Access and fulfillment",
        "stats": [
            {"label": "Submitted requests waiting", "value": waiting.count()},
            {"label": "Waiting longer than 7 days", "value": waiting.filter(submitted_at__lte=week_ago).count()},
            {"label": "Oldest submitted request", "value": age_label(oldest, now)},
            {"label": "Open orders", "value": Request.objects.filter(closed_at__isnull=True).count()},
            {"label": "Closed orders", "value": Request.objects.filter(closed_at__isnull=False).count()},
            {"label": "Sync failed", "value": MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.FAILED).count()},
            {"label": "Last successful sync", "value": last_sync},
        ],
        "columns": [
            {
                "title": "Data-access submissions",
                "chart": "column",
                "rows": choice_rows(
                    _counts_qs(limit_qs(FormSubmission.objects.all(), "created_at", submission_range, now), "status"),
                    SubmissionStatus.choices,
                ),
                "empty": "No submissions are recorded.",
                **_filters(date_filter(params, "submissions", "30d")),
            },
            {
                "title": "Forms with the most submissions",
                "chart": "bar",
                "rows": _top(
                    limit_qs(FormSubmission.objects.all(), "created_at", form_range, now),
                    "form__name",
                    lambda name: name or "Untitled form",
                ),
                "empty": "No submissions are recorded.",
                **_filters(date_filter(params, "forms", "30d")),
            },
            {
                "title": "Checkout",
                "chart": "bar",
                "rows": choice_rows(
                    _counts_qs(limit_qs(ProductCheckoutRequest.objects.all(), "created_at", checkout_range, now), "status"),
                    CheckoutStatus.choices,
                ),
                "empty": "No checkout requests are recorded.",
                **_filters(date_filter(params, "checkout", "30d")),
            },
            {
                "title": "Orders opened",
                "chart": order_chart,
                "time": True,
                "rows": order_rows,
                "empty": "No orders have an opened date.",
                **_filters(date_filter(params, "orders", "12m"), order_state),
            },
            {
                "title": "Approval stage",
                "chart": "bar",
                "rows": _top(
                    limit_qs(Request.objects.exclude(approval_stage=""), "opened_at", approval_range, now),
                    "approval_stage",
                    lambda value: value,
                ),
                "empty": "No approval stages are recorded.",
                **_filters(date_filter(params, "approval", "30d")),
            },
            {
                "title": "RITM state",
                "chart": "bar",
                "rows": _top(
                    limit_qs(Request.objects.exclude(ritm_state=""), "opened_at", ritm_range, now),
                    "ritm_state",
                    lambda value: value,
                ),
                "empty": "No RITM states are recorded.",
                **_filters(date_filter(params, "ritm", "30d")),
            },
            {
                "title": "ServiceNow sync",
                "chart": "column",
                "rows": choice_rows(
                    _counts_qs(limit_qs(MarketplaceOrder.objects.all(), "updated_at", sync_range, now), "sync_status"),
                    MarketplaceOrder.SyncStatus.choices,
                ),
                "empty": "No marketplace orders are recorded.",
                **_filters(date_filter(params, "sync", "all")),
            },
            {
                "title": "Latest sync failures",
                "chart": "list",
                "rows": failures,
                "empty": "No sync failures are recorded.",
                **_filters(date_filter(params, "failures", "30d")),
            },
            {
                "title": "Open tasks by assignment group",
                "chart": "bar",
                "rows": _top(open_tasks, "assignment_group", lambda name: name or "Unassigned", limit=8),
                "empty": "No open tasks are recorded.",
                **_filters(date_filter(params, "tasks", "all")),
            },
        ],
        "note": "",
    }


def _day_rows(queryset, field, days):
    from django.db.models.functions import TruncDate

    start = timezone.localdate() - timedelta(days=days - 1)
    grouped = {
        row["day"]: row["total"]
        for row in queryset.exclude(**{f"{field}__isnull": True})
        .filter(**{f"{field}__date__gte": start})
        .annotate(day=TruncDate(field))
        .values("day")
        .annotate(total=Count("id"))
    }
    return with_share([
        {"label": (start + timedelta(days=offset)).strftime("%m/%d"), "value": grouped.get(start + timedelta(days=offset), 0)}
        for offset in range(days)
    ])


def _notifications(params):
    from apps.notifications.models import (
        CampaignStatus,
        DeliveryChannel,
        DeliveryStatus,
        Notification,
        NotificationCampaign,
        NotificationDeadLetter,
        NotificationDelivery,
    )

    now = timezone.now()
    delivery_range = chosen(params, "deliveries", "7d")
    channel_range = chosen(params, "channels", "30d")
    deliveries = NotificationDelivery.objects.all()
    ranged = limit_qs(deliveries.filter(status=DeliveryStatus.DELIVERED), "delivered_at", delivery_range, now)
    if delivery_range in ("7d", "14d", "30d"):
        delivery_rows, delivery_chart = _day_rows(ranged, "delivered_at", RANGE_DAYS[delivery_range]), "area"
    else:
        delivery_rows, delivery_chart = _month_rows(ranged, "delivered_at"), "column"
    channel_deliveries = limit_qs(deliveries, "created_at", channel_range, now)
    delivered = deliveries.filter(status=DeliveryStatus.DELIVERED).count()
    rate = round(delivered * 100 / deliveries.count()) if deliveries.count() else 0
    channel_rows = []
    for value, label in (
        (DeliveryChannel.EMAIL, "Email"),
        (DeliveryChannel.TEAMS, "Microsoft Teams"),
        (DeliveryChannel.PUSH, "Mobile push"),
    ):
        channel = channel_deliveries.filter(channel=value)
        channel_delivered = channel.filter(status=DeliveryStatus.DELIVERED).count()
        finished = channel.filter(status__in=(DeliveryStatus.DELIVERED, DeliveryStatus.FAILED)).count()
        channel_rows.append({
            "label": label,
            "value": round(channel_delivered * 100 / finished) if finished else 0,
        })
    sending = [
        {"label": campaign.name, "value": "Sending", "bar": False}
        for campaign in NotificationCampaign.objects.filter(status=CampaignStatus.SENDING).order_by("-updated_at")[:5]
    ]
    return {
        "title": "Notifications",
        "stats": [
            {"label": "Created", "value": Notification.objects.count()},
            {"label": "Delivered", "value": delivered},
            {"label": "Delivery rate", "value": f"{rate}%"},
            {"label": "Unread", "value": Notification.objects.filter(read=False).count()},
            {"label": "Pending", "value": deliveries.filter(status=DeliveryStatus.PENDING).count()},
            {"label": "Processing", "value": deliveries.filter(status=DeliveryStatus.PROCESSING).count()},
            {"label": "Failed", "value": deliveries.filter(status=DeliveryStatus.FAILED).count()},
            {"label": "Open dead letters", "value": NotificationDeadLetter.objects.filter(status="open").count()},
            {"label": "Delivered in 30 days", "value": deliveries.filter(status=DeliveryStatus.DELIVERED, delivered_at__gte=now - timedelta(days=30)).count()},
        ],
        "columns": [
            {
                "title": "Deliveries",
                "chart": delivery_chart,
                "time": True,
                "rows": delivery_rows,
                "empty": "No deliveries in this range.",
                **_filters(date_filter(params, "deliveries", "7d")),
            },
            {
                "title": "Channel health",
                "chart": "bar",
                "rows": channel_rows,
                "empty": "No finished deliveries on email, Teams, or push.",
                "note": "Each bar is delivered out of delivered plus failed on that channel.",
                **_filters(date_filter(params, "channels", "30d")),
            },
            {
                "title": "Campaigns sending",
                "chart": "list",
                "rows": sending,
                "empty": "No campaign is sending.",
                **_filters(),
            },
        ],
        "note": "",
    }


def _parse_stamp(value):
    text = str(value or "").strip()
    if text.endswith(" UTC"):
        text = text[:-4]
    try:
        parsed = datetime.strptime(text, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None
    return timezone.make_aware(parsed, timezone.utc)


def _metric_rows(spec):
    from apps.third_party_apis.models import IntegrationDailyMetric

    queryset = IntegrationDailyMetric.objects.all()
    start = range_start(spec, timezone.now())
    if start is not None:
        queryset = queryset.filter(date__gte=timezone.localtime(start).date())
    if spec in ("7d", "14d", "30d"):
        days = RANGE_DAYS[spec]
        begin = timezone.localdate() - timedelta(days=days - 1)
        grouped = {
            row["date"]: row["requests"] or 0
            for row in queryset.filter(date__gte=begin).values("date").annotate(requests=Sum("request_count"))
        }
        return with_share([
            {"label": (begin + timedelta(days=offset)).strftime("%m/%d"), "value": grouped.get(begin + timedelta(days=offset), 0)}
            for offset in range(days)
        ]), "line"
    months = (
        queryset.annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(total=Sum("request_count"))
        .order_by("month")
    )
    shaped = [
        {"label": row["month"].strftime("%b %Y"), "value": row["total"] or 0}
        for row in months
        if row["month"]
    ]
    return with_share(shaped[-12:]), "column"


def _build_rows(spec):
    from gdx.deployment import ENVIRONMENT_LABELS, TARGETS, deployment_history

    start = range_start(spec, timezone.now())
    by_target = {key: 0 for key in TARGETS}
    by_environment = {}
    for item in deployment_history():
        stamp = _parse_stamp(item.get("finished_at") or item.get("started_at"))
        if start is not None and (stamp is None or stamp < start):
            continue
        if item.get("target") in by_target:
            by_target[item["target"]] += 1
        environment = item.get("environment") or ""
        if environment:
            by_environment[environment] = by_environment.get(environment, 0) + 1
    targets = with_share([{"label": label, "value": by_target[key]} for key, label in TARGETS.items()])
    environments = with_share([
        {"label": ENVIRONMENT_LABELS.get(key, key.title()), "value": count}
        for key, count in by_environment.items()
        if count
    ])
    return targets, environments


def _integrations(params):
    from apps.third_party_apis.models import InstalledThirdPartyApi, IntegrationDailyMetric
    from apps.third_party_apis.modules.command_center.platform import health_checks
    from apps.third_party_apis.modules.google_analytics.connection import public_connection
    from gdx.deployment import deployment_analytics

    totals = IntegrationDailyMetric.objects.aggregate(
        requests=Sum("request_count"),
        successes=Sum("success_count"),
        failures=Sum("failure_count"),
        warnings=Sum("warning_count"),
        duration=Sum("total_duration_ms"),
    )
    request_range = chosen(params, "integration", "14d")
    failure_range = chosen(params, "module_failures", "30d")
    build_range = chosen(params, "builds", "all")
    trend, trend_chart = _metric_rows(request_range)
    failure_start = range_start(failure_range, timezone.now())
    failure_query = IntegrationDailyMetric.objects.all()
    if failure_start is not None:
        failure_query = failure_query.filter(date__gte=timezone.localtime(failure_start).date())
    failing = []
    for row in (
        failure_query.values("module__name")
        .annotate(failures=Sum("failure_count"))
        .filter(failures__gt=0)
        .order_by("-failures")[:6]
    ):
        failing.append({"label": row["module__name"] or "Module", "value": row["failures"] or 0})
    build_targets, build_environments = _build_rows(build_range)
    modules = InstalledThirdPartyApi.objects.all()
    enabled = modules.filter(enabled=True).count()
    total_modules = modules.count()
    analytics = deployment_analytics()
    counts = analytics["counts"]
    checks = [
        {"label": check["name"], "value": check["state"], "bar": False}
        for check in health_checks()
    ]
    return {
        "title": "Integrations and platform",
        "stats": [
            {"label": "Modules", "value": total_modules},
            {"label": "Enabled", "value": enabled},
            {"label": "Disabled", "value": max(total_modules - enabled, 0)},
            {"label": "Requests", "value": totals["requests"] or 0},
            {"label": "Successes", "value": totals["successes"] or 0},
            {"label": "Failures", "value": totals["failures"] or 0},
            {"label": "Warnings", "value": totals["warnings"] or 0},
            {"label": "Request time", "value": duration_label(totals["duration"])},
            {"label": "Builds succeeded", "value": counts.get("succeeded", 0)},
            {"label": "Builds failed", "value": counts.get("failed", 0)},
            {"label": "Build running", "value": counts.get("running", 0)},
        ],
        "columns": [
            {"title": "Integration requests", "chart": trend_chart, "time": True, "rows": trend, "empty": "No integration requests are recorded.", **_filters(date_filter(params, "integration", "14d"))},
            {"title": "Modules with failures", "chart": "bar", "rows": with_share(failing), "empty": "No module has a recorded failure.", **_filters(date_filter(params, "module_failures", "30d"))},
            {"title": "Platform health", "chart": "list", "rows": checks, "empty": "", **_filters()},
            {"title": "Running release", "chart": "list", "rows": _release_versions(), "empty": "", **_filters()},
            {"title": "Builds by target", "chart": "column", "rows": build_targets, "empty": "No builds are recorded.", **_filters(date_filter(params, "builds", "all"))},
            {"title": "Builds by environment", "chart": "bar", "rows": build_environments, "empty": "No builds are recorded.", **_filters(date_filter(params, "builds", "all"))},
            google_column(public_connection()),
        ],
        "note": "",
    }


def _people(params):
    from django.contrib.auth import get_user_model
    from django.core.exceptions import ObjectDoesNotExist

    from apps.changelog.models import Post, ReleaseStatus
    from apps.pages.models import Page, PageVersion, WorkflowTask
    from apps.profiles.models import ACCESS_CHOICES, access_type_for
    labels = dict(ACCESS_CHOICES)
    roles = {label: 0 for label in labels.values()}
    role_range = chosen(params, "roles", "all")
    page_range = chosen(params, "content_pages", "all")
    version_range = chosen(params, "page_versions", "all")
    role_start = range_start(role_range, timezone.now())
    verified = 0
    for user in get_user_model().objects.select_related("profile").iterator():
        try:
            if user.profile.is_verified:
                verified += 1
        except ObjectDoesNotExist:
            pass
        if role_start is not None and getattr(user, "date_joined", None) and user.date_joined < role_start:
            continue
        role = labels.get(access_type_for(user), "User")
        roles[role] = roles.get(role, 0) + 1
    people = get_user_model().objects.count()
    now = timezone.now()
    return {
        "title": "People and content",
        "stats": [
            {"label": "Verified", "value": verified},
            {"label": "Unverified", "value": max(people - verified, 0)},
            {"label": "Open page tasks", "value": WorkflowTask.objects.filter(status=WorkflowTask.Status.OPEN).count()},
            {"label": "Pages awaiting deletion", "value": Page.objects.filter(is_deleted=True, purge_at__gt=now).count()},
            {"label": "Published releases", "value": Post.objects.filter(status=ReleaseStatus.PUBLISHED).count()},
            {"label": "Scheduled releases", "value": Post.objects.filter(status=ReleaseStatus.APPROVED, publish_at__isnull=False).count()},
        ],
        "columns": [
            {
                "title": "Accounts by access role",
                "chart": "bar",
                "rows": with_share([{"label": label, "value": count} for label, count in roles.items() if count]),
                "empty": "No accounts are recorded.",
                **_filters(date_filter(params, "roles", "all")),
            },
            {
                "title": "Content pages by type",
                "chart": "column",
                "rows": with_share([
                    {"label": row["page_type__name"] or "Untyped", "value": row["value"]}
                    for row in limit_qs(Page.objects.filter(is_deleted=False), "created_at", page_range, now)
                    .values("page_type__name")
                    .annotate(value=Count("id"))
                    .order_by("-value")
                ]),
                "empty": "No content pages are recorded.",
                **_filters(date_filter(params, "content_pages", "all")),
            },
            {
                "title": "Page versions",
                "chart": "bar",
                "rows": choice_rows(
                    _counts_qs(limit_qs(PageVersion.objects.all(), "created_at", version_range, now), "status"),
                    PageVersion.Status.choices,
                ),
                "empty": "No page versions are recorded.",
                **_filters(date_filter(params, "page_versions", "all")),
            },
        ],
        "note": "",
    }


def _apify():
    from apps.third_party_apis.models import InstalledThirdPartyApi
    from apps.third_party_apis.modules.apify_platforms.platform.models import (
        ApiAccessRequest,
        ApiMetric,
        ApiSubscription,
        UsageRecord,
    )

    enabled = InstalledThirdPartyApi.objects.filter(module_key="apify_platforms", enabled=True).exists()
    try:
        open_requests = ApiAccessRequest.objects.filter(status__in=("draft", "submitted")).count()
        active = ApiSubscription.objects.filter(status=ApiSubscription.Status.ACTIVE).count()
        usage = UsageRecord.objects.aggregate(requests=Sum("request_count"), errors=Sum("error_count"))
        recent = ApiMetric.objects.aggregate(requests=Sum("request_count"), errors=Sum("error_count"))
    except Exception:
        if not enabled:
            return None
        raise
    requests = (usage["requests"] or 0) + (recent["requests"] or 0)
    if not enabled and open_requests == 0 and active == 0 and requests == 0:
        return None
    return {
        "title": "Apify",
        "stats": [
            {"label": "Open access requests", "value": open_requests},
            {"label": "Active subscriptions", "value": active},
            {"label": "API requests", "value": requests},
            {"label": "API errors", "value": (usage["errors"] or 0) + (recent["errors"] or 0)},
        ],
        "columns": [],
        "note": "",
    }


def operations_report(params=None):
    params = params if params is not None else {}
    sections = [
        _style(_section("Marketplace catalog", lambda: _marketplace(params))),
        _style(_section("Access and fulfillment", lambda: _access(params))),
        _style(_section("Notifications", lambda: _notifications(params))),
        _style(_section("Integrations and platform", lambda: _integrations(params))),
        _style(_section("People and content", lambda: _people(params))),
    ]
    apify = _style(_section("Apify", _apify))
    if apify:
        sections.append(apify)
    query = [{"key": key, "value": value} for key, value in getattr(params, "items", lambda: [])()]
    return {"sections": sections, "query": query}
