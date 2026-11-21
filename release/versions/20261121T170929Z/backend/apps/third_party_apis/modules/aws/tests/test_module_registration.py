from django.test import SimpleTestCase

from apps.third_party_apis.registry import registry


class AWSMasterModuleRegistrationTests(SimpleTestCase):
    def test_aws_module_is_registered_with_master_registry(self):
        registry.autodiscover()
        module = registry.get("aws")
        self.assertEqual(module.display_name, "AWS Integrations")
        self.assertEqual(module.url_prefix, "aws/")
        self.assertEqual(module.required_secret_names, ())

    def test_aws_module_exposes_lazy_urlpatterns(self):
        registry.autodiscover()
        self.assertGreaterEqual(len(registry.get("aws").urlpatterns), 3)
