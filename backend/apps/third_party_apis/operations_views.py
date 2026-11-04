from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Sum
from django.shortcuts import render

from .models import (
    InstalledThirdPartyApi,
    IntegrationAuditLog,
    IntegrationDailyMetric,
)


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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
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
            "gdx_admin/apps/"
            "third_party_apis/"
            "documentation_index.html"
        ),
        {
            "modules": modules,
        },
    )