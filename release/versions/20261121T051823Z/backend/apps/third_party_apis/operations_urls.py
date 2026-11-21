from django.urls import path
from . import operations_views as views

app_name = "third_party_api_ops"

urlpatterns = [
    # ---------------------------------------------------------
    # Master dashboard
    # ---------------------------------------------------------

    path(
        "",
        views.dashboard,
        name="dashboard",
    ),

    # ---------------------------------------------------------
    # Intelligence
    # ---------------------------------------------------------

    path(
        "analytics/",
        views.analytics,
        name="analytics",
    ),

    path(
        "reports/",
        views.reports,
        name="reports",
    ),

    # ---------------------------------------------------------
    # Operations
    # ---------------------------------------------------------

    path(
        "configuration/",
        views.configuration,
        name="configuration",
    ),

    path(
        "activity/",
        views.activity,
        name="activity",
    ),

    path(
        "health/",
        views.health,
        name="health",
    ),

    path(
        "dependencies/",
        views.dependencies,
        name="dependencies",
    ),

    # ---------------------------------------------------------
    # Governance
    # ---------------------------------------------------------

    path(
        "audit/",
        views.audit_list,
        name="audit_list",
    ),

    # ---------------------------------------------------------
    # Reference
    # ---------------------------------------------------------

    path(
        "documentation/",
        views.documentation_index,
        name="documentation_index",
    ),

    # ---------------------------------------------------------
    # Per-module pages, generated for every registered module
    # ---------------------------------------------------------

    path(
        "<slug:module_key>/dashboard/",
        views.module_dashboard,
        name="module_dashboard",
    ),
    path(
        "<slug:module_key>/analytics/",
        views.module_analytics,
        name="module_analytics",
    ),
    path(
        "<slug:module_key>/health/",
        views.module_health,
        name="module_health",
    ),
    path(
        "<slug:module_key>/audit/",
        views.module_audit,
        name="module_audit",
    ),
    path(
        "<slug:module_key>/activity/",
        views.module_activity,
        name="module_activity",
    ),
    path(
        "<slug:module_key>/report/",
        views.module_report,
        name="module_report",
    ),
]