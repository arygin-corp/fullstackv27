from django.urls import path

from apps.third_party_apis.modules.google_analytics import views

app_name = "google_analytics"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
]
