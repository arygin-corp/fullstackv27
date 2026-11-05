from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import admin_views, builder_views, render_views
from .dar_builder_views import dar_form_builder_document, dar_marketplace_choices
from .views import FormChangeLogViewSet, FormDefinitionViewSet, FormSchemaView, FormStateView, FormSubmitView, SubmissionViewSet, FormPreFlightView


app_name = "dar-admin"

router = DefaultRouter()
router.register("definitions", FormDefinitionViewSet, basename="definitions")
router.register("submissions", SubmissionViewSet, basename="submissions")
router.register("audit-logs", FormChangeLogViewSet, basename="audit-logs")

urlpatterns = [
    path("api/", include(router.urls)),
    path("forms/", admin_views.dashboard, name="dashboard"),
    path("forms/definitions/", admin_views.form_list, name="form-list"),
    path("forms/submissions/", admin_views.submission_list, name="submission-list"),
    path("forms/analytics/", admin_views.analytics_dashboard, name="analytics"),
    path("forms/analytics/export/", admin_views.analytics_export, name="analytics-export"),
    path("forms/audit/", admin_views.audit_dashboard, name="audit-dashboard"),
    path("forms/audit/log/", admin_views.audit_log, name="audit-log"),
    path("forms/routing/", admin_views.routing_rules, name="routing-rules"),
    path("forms/routing/simulator/", admin_views.routing_simulator, name="routing-simulator"),
    path("forms/rules/", admin_views.rule_groups, name="rule-groups"),
    path("forms/rules/<int:pk>/", admin_views.rule_detail, name="rule-detail",),
    path("forms/validation/", admin_views.validation_rules, name="validation-rules"),
    path("forms/validation/simulator/", admin_views.validation_simulator, name="validation-simulator"),
    path("forms/lookups/project-codes/", admin_views.project_codes, name="project-codes"),
    path("forms/lookups/company-holidays/", admin_views.company_holidays, name="company-holidays"),
    path("forms/health/", admin_views.system_health, name="system-health-dashboard"),
    path("forms/audit/<int:pk>/", admin_views.audit_detail, name="audit-detail"),
    path("forms/routing/<int:pk>/", admin_views.routing_detail, name="routing-detail"),
    path("forms/definitions/<int:pk>/", admin_views.form_detail, name="form-detail"),
    path("forms/definitions/<int:pk>/preview/", admin_views.form_preview, name="form-preview"),
    path("forms/<slug:slug>/", render_views.render_form, name="render_form", ),
    path("forms/<slug:slug>/success/<int:submission_id>/", render_views.form_success, name="form-success"),
    path("forms/definitions/<int:pk>/builder/", builder_views.builder, name="form-builder"),
    path("forms/definitions/<int:pk>/builder/schema/", builder_views.builder_schema, name="form-builder-schema"),
    path("forms/definitions/<int:pk>/builder/publish/", builder_views.builder_publish, name="form-builder-publish"),
    path("dar-form-builder/document/", dar_form_builder_document, name="dar-form-builder-document"),
    path("dar-form-builder/marketplace-choices/<slug:source>/", dar_marketplace_choices, name="dar-marketplace-choices"),
    path("<slug:slug>/schema/", FormSchemaView.as_view(), name="form-schema",),
    path("api/forms/<slug:slug>/state/", FormStateView.as_view(), name="form-state"),
    path("api/forms/<slug:slug>/submit/", FormSubmitView.as_view(), name="form-submit"),
    path("api/forms/<slug:slug>/preflight/", FormPreFlightView.as_view(), name="form-preflight"),
    path("forms/submissions/<int:pk>/", admin_views.submission_detail, name="submission-detail"),
]
