from django.test import SimpleTestCase

from apps.third_party_apis.registry import registry


class MarketplaceCatalogModuleTests(SimpleTestCase):
    def test_modules_are_registered_with_their_owners(self):
        registry.autodiscover()
        expected = {
            "apify_platforms": ("Apify Platforms", "Apify (GDX Data Marketplace)", "/sa/apify/v1/api/"),
            "vikki": ("Vikki", "GDX Data Marketplace", "/api/ai/chat/"),
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

    def test_new_catalog_modules_keep_their_providers(self):
        registry.autodiscover()
        expected = {
            "search_engine": ("Search Engine", "GDX Data Marketplace"),
            "postgresql": ("PostgreSQL", "PostgreSQL Global Development Group"),
            "mysql": ("MySQL", "Oracle"),
            "microsoft_sql_server": ("Microsoft SQL Server", "Microsoft"),
            "mongodb": ("MongoDB", "MongoDB"),
            "redis": ("Redis", "Redis"),
            "oauth_2": ("OAuth 2.0", "IETF"),
            "openid_connect": ("OpenID Connect", "OpenID Foundation"),
            "saml": ("SAML", "OASIS"),
            "ldap_active_directory": ("LDAP/Active Directory", "Microsoft"),
            "mfa": ("MFA", "Identity providers"),
            "passkeys": ("Passkeys", "FIDO Alliance"),
            "abac": ("Attribute-Based Access Control (ABAC)", "GDX Data Marketplace"),
            "permission_engine": ("Permission Engine", "External authorization provider"),
            "policy_management": ("Policy Management", "External authorization provider"),
            "rabbitmq": ("RabbitMQ Service", "Broadcom"),
            "apache_kafka": ("Apache Kafka Service", "Apache Software Foundation"),
            "azure_service_bus": ("Azure Service Bus", "Microsoft"),
            "document_management": ("Document Management", "External document provider"),
            "microsoft_365": ("Microsoft 365", "Microsoft"),
            "sendgrid": ("SendGrid", "Twilio"),
            "amazon_ses": ("Amazon SES", "Amazon Web Services"),
            "mailgun": ("Mailgun", "Sinch"),
            "twilio_sms": ("Twilio", "Twilio"),
            "aws_sns": ("AWS SNS", "Amazon Web Services"),
            "twilio_voice": ("Twilio Voice", "Twilio"),
            "amazon_connect": ("Amazon Connect", "Amazon Web Services"),
            "github_actions": ("GitHub Actions", "GitHub"),
            "gitlab_ci": ("GitLab CI", "GitLab"),
            "jenkins": ("Jenkins", "Continuous Delivery Foundation"),
            "docker": ("Docker", "Docker"),
            "kubernetes": ("Kubernetes", "Cloud Native Computing Foundation"),
            "blog_news": ("Blog & News", "GDX Data Marketplace"),
            "internal_teams": ("Internal Teams", "GDX Data Marketplace"),
            "roadmap": ("Roadmap", "GDX Data Marketplace"),
            "hackathon": ("Hackathon", "GDX Data Marketplace"),
            "faqs": ("FAQs", "GDX Data Marketplace"),
            "support_help_platform": ("Support & Help Platform", "GDX Data Marketplace"),
            "multi_site_platform": ("Multi-Site Platform", "GDX Data Marketplace"),
            "campaign_page": ("Campaign Page", "GDX Data Marketplace"),
        }
        for key, (name, provider) in expected.items():
            module = registry.get(key)
            self.assertEqual(module.display_name, name)
            self.assertEqual(module.default_source_name, provider)
            self.assertEqual(module.owner, provider)
            self.assertEqual(module.upstream_provider, provider)
            if provider != "GDX Data Marketplace":
                self.assertNotIn("GDX Data Marketplace", module.tags)

    def test_vikki_is_connected_to_ai_knowledge(self):
        registry.autodiscover()
        vikki = registry.get("vikki")
        knowledge = registry.get("ai_knowledge")
        self.assertEqual(vikki.upstream_provider, "AI Knowledge")
        self.assertEqual(
            {route.name for route in knowledge.urlpatterns},
            {"api-document-search", "api-entities", "api-memories"},
        )
