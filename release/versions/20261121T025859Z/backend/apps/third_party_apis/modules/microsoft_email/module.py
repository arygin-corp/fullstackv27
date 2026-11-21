from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "microsoft_email"
    display_name = "Microsoft Email"
    description = "Microsoft email used for GDX notifications and campaigns."
    default_source_name = "Microsoft"
    owner = "Microsoft"
    icon_path = ""
    frontend_path = "sa/microsoft-email/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "Microsoft"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Email", "Microsoft")
    capabilities = ("Open email campaigns",)
    endpoints = (
        {
            "name": "Microsoft Email",
            "route_name": "microsoft_email:dashboard",
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
        return "/sa/microsoft-email/"


registry.register(Module())
