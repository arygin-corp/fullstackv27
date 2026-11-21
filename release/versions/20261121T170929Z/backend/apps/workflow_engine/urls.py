from django.urls import path
from apps.workflow_engine import views

app_name = "apps.workflow"

urlpatterns = [
    path("dashboard/", views.WorkflowDashboardView.as_view(), name="dashboard"),
    path("workflows/", views.WorkflowListView.as_view(), name="list"),
    path("workflows/new/", views.WorkflowBuilderView.as_view(), name="builder_new"),
    path("workflows/<uuid:pk>/", views.WorkflowDetailView.as_view(), name="detail"),
    path("workflows/<uuid:pk>/builder/", views.WorkflowBuilderView.as_view(), name="builder"),
    path("runs/", views.WorkflowRunListView.as_view(), name="runs"),
    path("runs/<uuid:pk>/", views.WorkflowRunDetailView.as_view(), name="run_detail"),
    path("audit/", views.WorkflowAuditView.as_view(), name="audit"),
    path("walkthrough/", views.WorkflowWalkthroughView.as_view(), name="walkthrough"),
    path("marketplace/", views.WorkflowMarketplaceView.as_view(), name="marketplace"),
    path("connectors/", views.WorkflowConnectorView.as_view(), name="connectors"),
    path("agents/", views.WorkflowAgentView.as_view(), name="agents"),
    path("governance/", views.WorkflowGovernanceView.as_view(), name="governance"),
    path("operations/", views.WorkflowOperationsView.as_view(), name="operations"),
    path("observability/", views.WorkflowObservabilityView.as_view(), name="observability"),
    path("simulation/", views.WorkflowSimulationView.as_view(), name="simulation"),
    path("vikki/", views.WorkflowVikkiView.as_view(), name="vikki"),
    path("settings/", views.WorkflowSettingsView.as_view(), name="settings"),
]
