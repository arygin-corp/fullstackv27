from django.urls import path

from apps.third_party_apis.modules.microsoft_teams import views

app_name = "microsoft_teams"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
]
