from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "notifications"
    display_name = "Notifications"
    description = "Inbox for approvals, alerts, and other notices. Users review and act on them here."
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    frontend_path = "api/v1/notifications/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Notifications", "GDX Data Marketplace")
    capabilities = ("List notifications", "Review approvals", "Open a notification", "Dismiss a notification", "Search")
    endpoints = (
        {
            "name": "List notifications",
            "route_name": "notifications_api_v1:list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Search",
            "route_name": "notifications_api_v1:master_api_search",
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
        return "/api/v1/notifications/"


registry.register(Module())
