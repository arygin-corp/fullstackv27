from django.test import SimpleTestCase

from apps.third_party_apis.registry import registry


class MarketplaceCatalogModuleTests(SimpleTestCase):
    def test_modules_are_registered_with_their_owners(self):
        registry.autodiscover()
        expected = {
            "apify_platforms": ("Apify Platforms", "Apify (GDX Data Marketplace)", "/sa/apify/v1/api/"),
            "vikki": ("Vikki", "GDX Marketplace", "/api/ai/chat/"),
            "changelog": ("Changelog", "GDX Data Marketplace", "/api/changelog/public/releases/"),
            "notifications": ("Notifications", "GDX Data Marketplace", "/api/v1/notifications/"),
            "ai_knowledge": ("AI Knowledge", "GDX Data Marketplace", "/api/ai/chat/documents/search/"),
            "orders": ("Orders", "OneTS", "/api/orders/orders/"),
            "pages": ("Pages", "GDX Data Marketplace", "/api/pages/pages/"),
            "resources": ("Resources", "GDX Data Marketplace", "/api/resources/"),
            "workflow_engine": ("Workflow Engine", "GDX Data Marketplace", "/api/workflow/workflows/"),
            "role_based_access_control": ("Role-Based Access Control", "GDX Data Marketplace", "/admin/auth/group/"),
            "email_campaign_manager": ("Email Campaign Manager", "GDX Data Marketplace", "/sa/notifications/campaigns/"),
        }
        for key, (name, source, endpoint) in expected.items():
            module = registry.get(key)
            self.assertEqual(module.display_name, name)
            self.assertEqual(module.default_source_name, source)
            self.assertEqual(module.public_endpoint(), endpoint)

    def test_vikki_is_connected_to_ai_knowledge(self):
        registry.autodiscover()
        vikki = registry.get("vikki")
        knowledge = registry.get("ai_knowledge")
        self.assertEqual(vikki.upstream_provider, "AI Knowledge")
        self.assertEqual(
            {route.name for route in knowledge.urlpatterns},
            {"api-document-search", "api-entities", "api-memories"},
        )
