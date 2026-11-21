from django.test import SimpleTestCase

from apps.third_party_apis.registry import registry


class ProductIntakeModuleTests(SimpleTestCase):
    def test_module_is_registered_for_the_marketplace(self):
        registry.autodiscover()
        module = registry.get("product_intake")
        self.assertEqual(module.display_name, "Product Intake")
        self.assertEqual(module.default_source_name, "GDX Data Marketplace")
        self.assertEqual(module.owner, "GDX Data Marketplace")
        self.assertIn("GDX Data Marketplace", module.tags)
        self.assertEqual(module.public_endpoint(), "/api/new/product/intake/")
        self.assertGreaterEqual(len(module.urlpatterns), 2)
        self.assertEqual(
            [endpoint["name"] for endpoint in module.endpoints],
            [
                "List requests",
                "Create request",
                "Submit request",
                "Approve request",
                "Add draft product",
                "Curate product",
                "Reject request",
                "Activate marketplace product",
            ],
        )
