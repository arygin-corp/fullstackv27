from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "google_analytics"
    display_name = "Google Analytics"
    description = "Connect a GA4 property with a Google service account."
    default_source_name = "Google"
    owner = "Google"
    icon_path = ""
    frontend_path = "sa/google-analytics/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "Google"
    upstream_method = "POST"
    upstream_authentication = "Service account"
    tags = ("Analytics", "Google")
    capabilities = ("Connect a GA4 property", "Read visitors, sessions, and page views")
    endpoints = (
        {
            "name": "Google Analytics",
            "route_name": "google_analytics:dashboard",
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
        return "/sa/google-analytics/"


registry.register(Module())
