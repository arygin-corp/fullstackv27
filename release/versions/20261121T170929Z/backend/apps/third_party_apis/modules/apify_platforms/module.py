from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "apify_platforms"
    display_name = "Apify Platforms"
    description = "Apify platform catalog for the GDX Data Marketplace: APIs, products, proxies, subscriptions, and publications."
    default_source_name = "Apify (GDX Data Marketplace)"
    owner = "Apify"
    icon_path = "images/brands/modules/apify.png"
    frontend_path = "sa/apify/v1/api/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "Apify"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Apify Platforms", "Apify", "GDX Data Marketplace")
    capabilities = ("List APIs", "Manage API products", "Review subscriptions")
    endpoints = (
        {
            "name": "List APIs",
            "route_name": "apify_api:api-list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
    )
    presentation = {
        "card": {
            "fields": (
                {"label": "Endpoint", "source": "frontend.endpoint", "format": "code", "hide_if_empty": True},
                {"label": "Method", "source": "frontend.method", "format": "text", "hide_if_empty": True},
                {"label": "Auth Type", "source": "frontend.authentication", "format": "text", "hide_if_empty": True},
                {"label": "Last Sync", "source": "last_success_at", "format": "datetime", "hide_if_empty": True},
            ),
        },
        "settings": {"sections": ("status", "governance", "frontend", "upstream", "health")},
        "documentation": {"sections": ("governance", "capabilities", "endpoints", "frontend", "upstream")},
    }

    def public_endpoint(self):
        return "/sa/apify/v1/api/"

    @property
    def urlpatterns(self):
        from .apify_api.urls import urlpatterns as api_urls
        from .apify_api.admin_urls import urlpatterns as admin_urls

        return list(api_urls) + list(admin_urls)


registry.register(Module())
