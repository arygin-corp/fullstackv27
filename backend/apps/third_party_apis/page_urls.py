from django.urls import path

from . import catalog_api
from . import test_views


app_name = "third_party_api_pages"


urlpatterns = [
    path(
        "integrations/",
        catalog_api.integration_catalog_page,
        name="integration_catalog",
    ),
    path(
        "integrations/readiness/",
        test_views.integration_test_dashboard,
        name="integration_test_dashboard",
    ),
    path(
        "integrations/<slug:module_key>/readiness/",
        test_views.integration_test,
        name="integration_test",
    ),
    path(
        "integrations/<slug:module_key>/documentation/",
        catalog_api.integration_documentation_page,
        name="integration_documentation",
    ),
]