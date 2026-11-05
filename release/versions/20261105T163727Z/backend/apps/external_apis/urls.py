from django.urls import path
from .gateway import PublishedGatewayView
from .views import APIKeyCreateView, EndpointCatalogView
app_name = "external_apis"
urlpatterns = [
    path("catalog/", EndpointCatalogView.as_view(), name="catalog"),
    path("applications/<int:application_id>/keys/", APIKeyCreateView.as_view(), name="key-create"),
    path("<str:version>/<slug:public_slug>/", PublishedGatewayView.as_view(), name="published-gateway")
]
