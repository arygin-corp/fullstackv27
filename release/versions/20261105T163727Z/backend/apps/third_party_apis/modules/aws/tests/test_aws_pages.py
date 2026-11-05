from django.test import SimpleTestCase
from django.urls import reverse

from apps.third_party_apis.modules.aws.choices import AwsResourceType, parity_status, resource_category, service_summary
from apps.third_party_apis.registry import registry


class AwsCatalogPageTests(SimpleTestCase):
    def test_every_resource_type_has_a_category(self):
        missing = [
            value
            for value, _label in AwsResourceType.choices
            if resource_category(value) == "Other"
        ]
        self.assertEqual(missing, [])

    def test_parity_status_distinguishes_enabled_disabled_and_missing(self):
        self.assertEqual(parity_status(0, 0), ("missing", "Not configured"))
        self.assertEqual(parity_status(2, 0), ("attention", "Configured but disabled"))
        self.assertEqual(parity_status(2, 1), ("ok", "1 enabled resource"))
        self.assertEqual(parity_status(3, 2), ("ok", "2 enabled resources"))

    def test_every_resource_type_has_a_summary(self):
        missing = [value for value, _label in AwsResourceType.choices if not service_summary(value)]
        self.assertEqual(missing, [])

    def test_service_list_url(self):
        self.assertEqual(
            reverse("third_party_api_aws:resource_list", kwargs={"environment": "prod"}),
            "/sa/modules/aws/prod/resources/list/",
        )

    def test_aws_module_renders_its_own_operation_pages(self):
        registry.autodiscover()
        module = registry.get("aws")
        self.assertTrue(callable(module.render_operation_page))
