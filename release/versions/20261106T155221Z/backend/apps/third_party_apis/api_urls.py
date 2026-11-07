from django.urls import path

from . import catalog_views, manage_views, state_views, test_views
from . import manage_views
from . import state_views
from . import test_views

app_name = "third_party_api"

urlpatterns = [
    path("catalog/", catalog_views.integration_catalog_api, name="integration_catalog_api",),
    path("integrations/sync/", catalog_views.sync_integrations, name="sync_integrations",),
    path("state/bulk/", state_views.bulk_module_state, name="bulk_integration_state_api",),
    path("<slug:module_key>/state/", state_views.set_module_state, name="integration_state_api",),
    path("<slug:module_key>/manage/", manage_views.manage, name="integration_manage_api",),
    path("<slug:module_key>/icon/", manage_views.upload_icon, name="integration_icon_api",),
    path("test/<slug:module_key>/run/", test_views.integration_test, name="integration_test_run",),
]
