from django.test import SimpleTestCase

from apps.third_party_apis.registry import registry


class DataAccessRequestModuleTests(SimpleTestCase):
    def test_module_is_registered_for_the_marketplace(self):
        registry.autodiscover()
        module = registry.get("data_access_request")
        self.assertEqual(module.display_name, "Data Access Request (DAR)")
        self.assertEqual(module.default_source_name, "GDX Data Marketplace")
        self.assertEqual(module.owner, "GDX Data Marketplace")
        self.assertEqual(module.public_endpoint(), "/api/integrations/data-access-request/<slug>/schema/")
        self.assertGreaterEqual(len(module.urlpatterns), 4)
        self.assertEqual(module.frontend_method, "GET")
        self.assertEqual(
            [endpoint["name"] for endpoint in module.endpoints],
            ["Form schema", "Form state", "Preflight", "Submit request"],
        )
