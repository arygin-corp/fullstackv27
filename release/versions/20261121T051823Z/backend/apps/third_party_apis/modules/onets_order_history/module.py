from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "onets_orders"
    display_name = "OneTS Orders"
    description = "OneTS order history, save, and event update published by OneTS."
    default_source_name = "OneTS"
    owner = "OneTS"
    icon_path = ""
    upstream_provider = "OneTS"
    upstream_method = "GET"
    upstream_authentication = "Basic"
    tags = ("Orders", "OneTS")
    capabilities = ("Read order history", "Save a request", "Refresh request events")

    def public_endpoint(self):
        return "/view/endpoint/requests/"

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


registry.register(Module())
