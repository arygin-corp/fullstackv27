from django.urls import path

from apps.third_party_apis.modules.command_center import views

app_name = "command_center"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("analytics/", views.analytics, name="analytics"),
    path("my-dashboards/", views.my_dashboards, name="my_dashboards"),
    path("my-reports/", views.my_reports, name="my_reports"),
    path("reports/", views.reports, name="reports"),
    path("health/", views.health, name="health"),
    path("workflow/", views.workflow, name="workflow"),
    path("create/", views.builder, name="builder"),
    path("views/<str:view_id>/", views.view_detail, name="view"),
    path("views/<str:view_id>/delete/", views.remove, name="remove"),
    path("views/<str:view_id>/elements/", views.add, name="add_element"),
    path("views/<str:view_id>/elements/<str:element_id>/delete/", views.remove_widget, name="remove_element"),
]
