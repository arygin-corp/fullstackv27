from django.urls import path

from gdx import deployment_views

app_name = "deployment"

urlpatterns = [
    path("", deployment_views.dashboard, name="dashboard"),
    path("analytics/", deployment_views.analytics, name="analytics"),
    path("activity/", deployment_views.activity, name="activity"),
    path("releases/", deployment_views.releases, name="releases"),
    path("rollback/", deployment_views.releases, name="rollback"),
    path("health/", deployment_views.health, name="health"),
]
