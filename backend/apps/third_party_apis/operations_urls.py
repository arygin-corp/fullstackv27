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
]