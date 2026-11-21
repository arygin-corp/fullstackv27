from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum
from django.shortcuts import render

from .models import (
    InstalledThirdPartyApi,
    IntegrationAuditLog,
    IntegrationDailyMetric,
)
from .module_pages import module_page_links, registered_module
from .operational_status import ModuleOperationalStatus


def _metric_totals(queryset):
    return queryset.aggregate(
        requests=Sum("request_count"),
        successes=Sum("success_count"),
        failures=Sum("failure_count"),
        warnings=Sum("warning_count"),
        duration=Sum("total_duration_ms"),
    )


@staff_member_required
def dashboard(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    metrics = _metric_totals(
        IntegrationDailyMetric.objects.all()
    )

    context = {
        "modules": modules,
        "module_count": modules.count(),
        "enabled_count": modules.filter(
            enabled=True
        ).count(),
        "disabled_count": modules.filter(
            enabled=False
        ).count(),
        "request_count": (
            metrics["requests"]
            or 0
        ),
        "success_count": (
            metrics["successes"]
            or 0
        ),
        "failure_count": (
            metrics["failures"]
            or 0
        ),
        "warning_count": (
            metrics["warnings"]
            or 0
        ),
        "total_duration_ms": (
            metrics["duration"]
            or 0
        ),
        "recent_events": (
            IntegrationAuditLog.objects
            .select_related(
                "module",
                "actor",
            )
            .order_by(
                "-created_at"
            )[:10]
        ),
    }

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "dashboard.html"
        ),
        context,
    )


@staff_member_required
def analytics(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    metrics = _metric_totals(
        IntegrationDailyMetric.objects.all()
    )

    context = {
        "modules": modules,
        "module_count": modules.count(),
        "enabled_count": modules.filter(
            enabled=True
        ).count(),
        "request_count": metrics["requests"] or 0,
        "success_count": metrics["successes"] or 0,
        "failure_count": metrics["failures"] or 0,
        "warning_count": metrics["warnings"] or 0,
        "total_duration_ms": metrics["duration"] or 0,
    }

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "analytics.html"
        ),
        context,
    )


@staff_member_required
def reports(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "reports.html"
        ),
        {
            "modules": modules,
            "module_count": modules.count(),
            "enabled_count": modules.filter(
                enabled=True
            ).count(),
        },
    )


@staff_member_required
def configuration(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "configuration.html"
        ),
        {
            "modules": modules,
        },
    )


@staff_member_required
def activity(request):
    activity_rows = (
        IntegrationAuditLog.objects
        .select_related(
            "module",
            "actor",
        )
        .order_by(
            "-created_at"
        )[:100]
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "activity.html"
        ),
        {
            "activity_rows": activity_rows,
        },
    )


@staff_member_required
def audit_list(request):
    audit_rows = (
        IntegrationAuditLog.objects
        .select_related(
            "module",
            "actor",
        )
        .order_by(
            "-created_at"
        )[:100]
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "audit/"
            "list.html"
        ),
        {
            "audit_rows": audit_rows,
        },
    )


@staff_member_required
def health(request):
    modules = (
        InstalledThirdPartyApi.objects
        .prefetch_related(
            "test_runs",
            "audit_logs",
        )
        .order_by(
            "name"
        )
    )

    rows = []

    for module in modules:
        latest_test = (
            module.test_runs
            .order_by(
                "-started_at"
            )
            .first()
        )

        rows.append(
            {
                "module": module,
                "latest_test": latest_test,
                "failure_count": (
                    module.audit_logs
                    .filter(
                        result="FAILURE"
                    )
                    .count()
                ),
                "warning_count": (
                    module.audit_logs
                    .filter(
                        result="WARNING"
                    )
                    .count()
                ),
            }
        )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "health.html"
        ),
        {
            "rows": rows,
        },
    )


@staff_member_required
def dependencies(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "dependencies.html"
        ),
        {
            "modules": modules,
        },
    )


@staff_member_required
def documentation_index(request):
    modules = InstalledThirdPartyApi.objects.order_by(
        "name"
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "documentation_index.html"
        ),
        {
            "modules": modules,
        },
    )


class _ModulePage:
    """Template-facing module identity, with or without a database row."""

    def __init__(self, module, row):
        self.module_key = module.key
        self.name = (
            row.name
            if row is not None and row.name
            else getattr(module, "display_name", "") or module.key
        )
        self.description = (
            row.description
            if row is not None and row.description
            else getattr(module, "description", "") or ""
        )
        self.source_name = (
            row.source_name
            if row is not None and row.source_name
            else getattr(module, "default_source_name", "") or ""
        )
        self.owner = getattr(module, "owner", "") or ""
        self.enabled = bool(row.enabled) if row is not None else False
        self.installed = row is not None
        self.last_success_at = row.last_success_at if row is not None else None
        self.endpoint = _public_endpoint(module)


def _public_endpoint(module):
    public_endpoint = getattr(module, "public_endpoint", None)
    if not callable(public_endpoint):
        return ""
    try:
        return public_endpoint() or ""
    except (AttributeError, TypeError, ValueError):
        return ""


def _module_metrics(row):
    if row is None:
        return {
            "requests": 0,
            "successes": 0,
            "failures": 0,
            "warnings": 0,
            "duration": 0,
        }
    totals = _metric_totals(row.daily_metrics.all())
    return {
        "requests": totals["requests"] or 0,
        "successes": totals["successes"] or 0,
        "failures": totals["failures"] or 0,
        "warnings": totals["warnings"] or 0,
        "duration": totals["duration"] or 0,
    }


def _module_logs(row):
    if row is None:
        return IntegrationAuditLog.objects.none()
    return (
        row.audit_logs
        .select_related("module", "actor")
        .order_by("-created_at")
    )


def _module_health(module, row):
    latest = None
    failure_count = 0
    warning_count = 0
    if row is not None:
        latest = row.test_runs.order_by("-started_at").first()
        failure_count = row.audit_logs.filter(result="FAILURE").count()
        warning_count = row.audit_logs.filter(result="WARNING").count()
    if latest is None:
        status = "not_tested" if row is not None else "not_installed"
        checked_at = None
    else:
        status = latest.status
        checked_at = latest.completed_at or latest.started_at
    return {
        "status": status,
        "last_checked_at": checked_at,
        "failure_count": failure_count,
        "warning_count": warning_count,
        "missing_required": list(
            ModuleOperationalStatus(module).missing_required()
        ),
    }


_PAGE_COPY = {
    "dashboard": {
        "label": "Dashboard",
        "heading": "Module dashboard",
        "subheading": "Inventory, recorded activity, and the latest health result for this module.",
        "kicker": "MODULE DASHBOARD",
        "description": "Operational summary for this integration.",
        "icon": "▦",
    },
    "analytics": {
        "label": "Analytics",
        "heading": "Module analytics",
        "subheading": "Request, success, failure, and duration totals recorded for this module.",
        "kicker": "MODULE ANALYTICS",
        "description": "Persisted daily metrics for this integration.",
        "icon": "⌁",
    },
    "health": {
        "label": "Health",
        "heading": "Module health",
        "subheading": "Latest readiness result, failure counts, and missing required settings.",
        "kicker": "MODULE HEALTH",
        "description": "Readiness and configuration health for this integration.",
        "icon": "✓",
    },
    "audit": {
        "label": "Audit",
        "heading": "Module audit",
        "subheading": "Recorded administrative and operational events for this module.",
        "kicker": "MODULE AUDIT",
        "description": "Audit history for this integration.",
        "icon": "◎",
    },
    "activity": {
        "label": "Activity",
        "heading": "Module activity",
        "subheading": "The same recorded event stream, read as recent operational activity.",
        "kicker": "MODULE ACTIVITY",
        "description": "Recent operational events for this integration.",
        "icon": "◌",
    },
    "report": {
        "label": "Report",
        "heading": "Module report",
        "subheading": "A single report of identity, usage, health, and recent failures.",
        "kicker": "MODULE REPORT",
        "description": "Current operational report for this integration.",
        "icon": "▤",
    },
}


def _render_module_page(request, module_key, page_key):
    module = registered_module(module_key)
    renderer = getattr(module, "render_operation_page", None)
    if callable(renderer):
        response = renderer(request, page_key)
        if response is not None:
            return response
    row = (
        InstalledThirdPartyApi.objects
        .filter(module_key=module.key)
        .first()
    )
    record = _ModulePage(module, row)
    copy = _PAGE_COPY[page_key]
    logs = _module_logs(row)
    return render(
        request,
        "gdx_admin/pages/third_party_apis/module_page.html",
        {
            "module": record,
            "page_key": page_key,
            "pages": module_page_links(module.key),
            "page_label": copy["label"],
            "page_heading": copy["heading"],
            "page_subheading": copy["subheading"],
            "hero_kicker": copy["kicker"],
            "hero_description": copy["description"],
            "hero_icon": copy["icon"],
            "metrics": _module_metrics(row),
            "daily_metrics": (
                row.daily_metrics.order_by("-date")[:30]
                if row is not None
                else []
            ),
            "logs": logs[:50],
            "failures": logs.filter(result="FAILURE")[:20],
            "health": _module_health(module, row),
        },
    )


@staff_member_required
def module_dashboard(request, module_key):
    return _render_module_page(request, module_key, "dashboard")


@staff_member_required
def module_analytics(request, module_key):
    return _render_module_page(request, module_key, "analytics")


@staff_member_required
def module_health(request, module_key):
    return _render_module_page(request, module_key, "health")


@staff_member_required
def module_audit(request, module_key):
    return _render_module_page(request, module_key, "audit")


@staff_member_required
def module_activity(request, module_key):
    return _render_module_page(request, module_key, "activity")


@staff_member_required
def module_report(request, module_key):
    return _render_module_page(request, module_key, "report")