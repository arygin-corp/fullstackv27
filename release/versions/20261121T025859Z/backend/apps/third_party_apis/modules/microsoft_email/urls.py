from django.urls import path

from apps.third_party_apis.modules.microsoft_email import views

app_name = "microsoft_email"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
]
