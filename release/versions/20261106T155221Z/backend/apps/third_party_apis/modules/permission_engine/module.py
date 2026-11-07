from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "permission_engine"
    display_name = "Permission Engine"
    description = "Permission decisions supplied by an external authorization product."
    default_source_name = "External authorization provider"
    owner = "External authorization provider"
    icon_path = ""
    upstream_provider = "External authorization provider"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Authorization", "External authorization provider")
    capabilities = ('Check access', 'Explain decisions', 'Revoke access')
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
