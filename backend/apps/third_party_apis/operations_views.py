import os

from django.conf import settings as django_settings
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

    module_count = modules.count()
    enabled_count = modules.filter(enabled=True).count()
    request_count = metrics["requests"] or 0
    success_count = metrics["successes"] or 0
    failure_count = metrics["failures"] or 0
    warning_count = metrics["warnings"] or 0

    def share(part, whole):
        if not whole:
            return 0
        return max(0, min(100, int(round(100 * part / whole))))

    context = {
        "modules": modules,
        "module_count": module_count,
        "enabled_count": enabled_count,
        "disabled_count": modules.filter(
            enabled=False
        ).count(),
        "enabled_share": share(enabled_count, module_count),
        "request_count": request_count,
        "success_count": success_count,
        "failure_count": failure_count,
        "warning_count": warning_count,
        "success_share": share(success_count, request_count),
        "failure_share": share(failure_count, request_count),
        "warning_share": share(warning_count, request_count),
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


def _setting_value(name):
    """Read the same place the integration services read: the process environment, then Django settings."""
    if name in os.environ:
        return os.environ.get(name)
    return getattr(django_settings, name, "")


def _is_present(name):
    value = _setting_value(name)
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return bool(value)


def _configuration_settings(module):
    secrets = set(getattr(module, "required_secret_names", ()) or ())
    required = list(getattr(module, "required_setting_names", ()) or ())
    optional = list(getattr(module, "optional_setting_names", ()) or ())
    defaulted = dict(getattr(module, "defaulted_settings", {}) or {})
    endpoint_setting = getattr(module, "upstream_endpoint_setting", "") or ""
    names = []
    for name in required + list(secrets) + optional + list(defaulted) + ([endpoint_setting] if endpoint_setting else []):
        if name and name not in names:
            names.append(name)
    rows = []
    for name in names:
        is_secret = name in secrets
        is_required = name in required or name in secrets or name == endpoint_setting
        is_defaulted = name in defaulted
        configured = _is_present(name) or is_defaulted
        if is_required:
            category = "Required"
        elif is_defaulted:
            category = "Defaulted"
        else:
            category = "Optional"
        detail = ""
        if is_defaulted and not is_secret:
            detail = f"Default {defaulted[name]}"
        rows.append({
            "name": name,
            "category": category,
            "secret": is_secret,
            "configured": configured,
            "detail": detail,
        })
    return rows


def _configuration_rows():
    from gdx.removal import hidden_module_keys
    from .registry import registry

    registry.autodiscover()
    installed = {
        row.module_key: row
        for row in InstalledThirdPartyApi.objects.all()
    }
    hidden = hidden_module_keys()
    rows = []
    for module in registry.all():
        if module.key in hidden:
            continue
        record = installed.get(module.key)
        settings_rows = _configuration_settings(module)
        missing_required = [
            item["name"]
            for item in settings_rows
            if item["category"] == "Required" and not item["configured"]
        ]
        optional_unset = [
            item["name"]
            for item in settings_rows
            if item["category"] == "Optional" and not item["configured"]
        ]
        rows.append({
            "key": module.key,
            "name": getattr(module, "display_name", "") or module.key,
            "source": getattr(module, "default_source_name", "") or "Internal",
            "description": getattr(module, "description", "") or "",
            "enabled": bool(record.enabled) if record is not None else False,
            "installed": record is not None,
            "owner": getattr(module, "owner", "") or "",
            "support_group": getattr(module, "support_group", "") or "",
            "provider": getattr(module, "upstream_provider", "") or "",
            "method": getattr(module, "upstream_method", "") or "",
            "authentication": getattr(module, "upstream_authentication", "") or "",
            "frontend_method": getattr(module, "frontend_method", "") or "",
            "frontend_authentication": getattr(module, "frontend_authentication", "") or "",
            "endpoint": _public_endpoint(module),
            "settings": settings_rows,
            "configured_count": sum(1 for item in settings_rows if item["configured"]),
            "setting_count": len(settings_rows),
            "missing_required": missing_required,
            "optional_unset": optional_unset,
            "ready": not missing_required,
        })
    rows.sort(key=lambda item: (item["ready"], not item["settings"], item["name"].lower()))
    return rows


@staff_member_required
def configuration(request):
    rows = _configuration_rows()
    missing_count = sum(len(item["missing_required"]) for item in rows)
    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "configuration.html"
        ),
        {
            "rows": rows,
            "module_count": len(rows),
            "ready_count": sum(1 for item in rows if item["ready"]),
            "attention_count": sum(1 for item in rows if not item["ready"]),
            "missing_count": missing_count,
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
        )
    )
    module_key = (request.GET.get("module") or "").strip()
    result = (request.GET.get("result") or "").strip()
    if module_key:
        audit_rows = audit_rows.filter(module__module_key=module_key)
    if result:
        audit_rows = audit_rows.filter(result=result)

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "audit/"
            "list.html"
        ),
        {
            "audit_rows": audit_rows[:100],
            "modules": InstalledThirdPartyApi.objects.order_by("name"),
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


def _dependency_rows():
    from gdx.removal import hidden_module_keys
    from .registry import registry

    registry.autodiscover()
    hidden = hidden_module_keys()
    rows = []
    for module in registry.all():
        if module.key in hidden:
            continue
        endpoint_setting = getattr(module, "upstream_endpoint_setting", "") or ""
        required = list(getattr(module, "required_setting_names", ()) or ())
        secrets = list(getattr(module, "required_secret_names", ()) or ())
        configured = bool(endpoint_setting) and _is_present(endpoint_setting)
        rows.append({
            "key": module.key,
            "name": getattr(module, "display_name", "") or module.key,
            "provider": getattr(module, "upstream_provider", "") or "Internal",
            "method": getattr(module, "upstream_method", "") or "",
            "authentication": getattr(module, "upstream_authentication", "") or getattr(module, "frontend_authentication", "") or "",
            "endpoint": _public_endpoint(module),
            "endpoint_setting": endpoint_setting,
            "endpoint_configured": configured,
            "required_count": len(set(required)),
            "secret_count": len(set(secrets)),
            "needs_endpoint": bool(endpoint_setting) and not configured,
        })
    rows.sort(key=lambda item: (not item["needs_endpoint"], item["name"].lower()))
    return rows


@staff_member_required
def dependencies(request):
    rows = _dependency_rows()
    grouped = {}
    for item in rows:
        grouped.setdefault(item["provider"], []).append(item)
    provider_rows = [
        {
            "name": name,
            "count": len(items),
            "missing": sum(1 for entry in items if entry["needs_endpoint"]),
            "configured": sum(1 for entry in items if entry["endpoint_configured"]),
        }
        for name, items in grouped.items()
    ]
    provider_rows.sort(key=lambda item: item["name"].lower())
    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "dependencies.html"
        ),
        {
            "rows": rows,
            "module_count": len(rows),
            "provider_rows": provider_rows,
            "provider_count": len(provider_rows),
            "configured_count": sum(1 for item in rows if item["endpoint_configured"]),
            "missing_count": sum(1 for item in rows if item["needs_endpoint"]),
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