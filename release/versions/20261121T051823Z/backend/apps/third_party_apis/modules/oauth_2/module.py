from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "oauth_2"
    display_name = "OAuth 2.0"
    description = "OAuth 2.0 authorization framework published by the IETF."
    default_source_name = "IETF"
    owner = "IETF"
    icon_path = ""
    upstream_provider = "IETF"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Authentication", "IETF")
    capabilities = ('Authorization code', 'Client credentials', 'Tokens')
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
