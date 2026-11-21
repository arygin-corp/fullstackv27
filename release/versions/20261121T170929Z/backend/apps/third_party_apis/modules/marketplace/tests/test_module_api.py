from django.test import SimpleTestCase
from django.urls import reverse

from apps.marketplace.urls import urlpatterns as marketplace_api
from apps.third_party_apis.registry import registry


class MarketplaceModuleApiTests(SimpleTestCase):
    def test_module_uses_the_marketplace_api(self):
        registry.autodiscover()
        module = registry.get("marketplace")
        self.assertEqual(module.public_endpoint(), "/marketplace/api/products/")
        self.assertEqual(module.urlpatterns, marketplace_api)
        self.assertGreaterEqual(len(module.urlpatterns), 2)
        for basename in (
            "api-products",
            "api-domains",
            "api-subdomains",
            "api-datatypes",
            "api-classifications",
            "api-contacts",
            "api-catalogs",
            "api-badges",
            "api-platforms",
            "api-organizations",
            "api-companies",
            "api-data-stewards",
            "api-keywords",
            "api-attribute-types",
            "api-attributes",
            "api-onets-domains",
            "api-ad-groups",
            "api-fulfillment-teams",
            "api-product-images",
            "api-product-associations",
            "api-end-to-end-products",
            "api-synonyms",
            "api-search-logs",
            "api-reviews",
            "api-search-embeddings",
            "api-subdomain-groups",
        ):
            self.assertTrue(reverse(f"marketplace:{basename}-list").startswith("/marketplace/api/"))
