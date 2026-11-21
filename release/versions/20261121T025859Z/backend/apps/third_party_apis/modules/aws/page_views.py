"""AWS-specific dashboard, analytics, health, audit, activity, and report pages."""

from django.shortcuts import render

from apps.third_party_apis.models import InstalledThirdPartyApi
from apps.third_party_apis.module_pages import module_page_links

from .selectors import (
    adapter_inventory,
    ensure_environment_configs,
    environment_health,
    parity_matrix,
    recent_changes,
)


class _AwsModule:
    module_key = "aws"
    name = "AWS Integrations"
    description = (
        "Centralized AWS integration catalog, resource health, dependencies, "
        "capabilities, audit history, and Demo/Dev/Stage/QA/Prod parity."
    )


_PAGE_COPY = {
    "dashboard": {
        "label": "Dashboard",
        "heading": "AWS dashboard",
        "subheading": "Environments, configured resources, adapters, and parity for this module.",
        "metric_label": "Enabled resources",
    },
    "analytics": {
        "label": "Analytics",
        "heading": "AWS analytics",
        "subheading": "How configured resources are distributed across types and environments.",
        "metric_label": "Configured resources",
    },
    "health": {
        "label": "Health",
        "heading": "AWS health",
        "subheading": "Environment setup, adapter coverage, and services that still have no adapter.",
        "metric_label": "Environment issues",
    },
    "audit": {
        "label": "Audit",
        "heading": "AWS audit",
        "subheading": "Catalog edits and integration audit events recorded for AWS.",
        "metric_label": "Recorded changes",
    },
    "activity": {
        "label": "Activity",
        "heading": "AWS activity",
        "subheading": "Latest environment and resource configuration changes.",
        "metric_label": "Recent changes",
    },
    "report": {
        "label": "Report",
        "heading": "AWS report",
        "subheading": "Environment identity and resource parity across Demo, Dev, Stage, QA, and Prod.",
        "metric_label": "Aligned types",
    },
}


def _analytics_rows(matrix):
    rows = []
    for row in matrix:
        enabled = sum(1 for cell in row["cells"] if cell["status"] == "ok")
        configured = sum(1 for cell in row["cells"] if cell["status"] != "missing")
        if not configured:
            continue
        rows.append({
            "label": row["label"],
            "category": row["category"],
            "environments_configured": configured,
            "environments_enabled": enabled,
            "aligned": row["aligned"],
        })
    return rows


def render_aws_page(request, page_key):
    environments = ensure_environment_configs()
    matrix = parity_matrix(environments)
    adapters, uncovered = adapter_inventory()
    health_rows = environment_health(environments)
    changes = recent_changes()
    installed = InstalledThirdPartyApi.objects.filter(module_key="aws").first()
    audit_logs = (
        installed.audit_logs.select_related("actor").order_by("-created_at")[:50]
        if installed is not None
        else []
    )
    configured_resources = sum(row["resource_count"] for row in health_rows)
    enabled_resources = sum(row["enabled_resource_count"] for row in health_rows)
    issue_count = sum(len(row["issues"]) for row in health_rows)
    aligned = sum(1 for row in matrix if row["aligned"])
    copy = _PAGE_COPY[page_key]
    metrics = {
        "dashboard": enabled_resources,
        "analytics": configured_resources,
        "health": issue_count,
        "audit": len(changes) + len(audit_logs),
        "activity": len(changes),
        "report": aligned,
    }
    return render(
        request,
        "third_party_apis/aws/operation_page.html",
        {
            "module": _AwsModule(),
            "page_key": page_key,
            "pages": module_page_links("aws"),
            "page_label": copy["label"],
            "page_heading": copy["heading"],
            "page_subheading": copy["subheading"],
            "hero_metric_label": copy["metric_label"],
            "hero_metric": metrics[page_key],
            "environments": environments,
            "health_rows": health_rows,
            "matrix": matrix,
            "analytics_rows": _analytics_rows(matrix),
            "adapters": adapters,
            "uncovered": uncovered,
            "changes": changes if page_key == "audit" else changes[:12],
            "audit_logs": audit_logs,
            "configured_resources": configured_resources,
            "enabled_resources": enabled_resources,
            "aligned_count": aligned,
            "resource_type_count": len(matrix),
        },
    )
