from django.urls import path
from . import views

app_name = "third_party_api_aws"

urlpatterns = [
    path("", views.index, name="index"),
    path("parity/", views.parity, name="parity"),
    path("<str:environment>/settings/", views.environment_settings, name="environment_settings"),
    path("<str:environment>/resources/list/", views.resource_list, name="resource_list"),
    path("<str:environment>/resources/new/", views.resource_create, name="resource_create"),
    path("resources/<int:pk>/", views.resource_detail, name="resource_detail"),
]