from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "microsoft_teams"
    display_name = "Microsoft Teams"
    description = "Microsoft Teams destinations for GDX notifications."
    default_source_name = "Microsoft"
    owner = "Microsoft"
    icon_path = ""
    frontend_path = "sa/microsoft-teams/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "Microsoft"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Chat", "Microsoft")
    capabilities = ("Open Teams destinations",)
    endpoints = (
        {
            "name": "Microsoft Teams",
            "route_name": "microsoft_teams:dashboard",
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
        return "/sa/microsoft-teams/"


registry.register(Module())
