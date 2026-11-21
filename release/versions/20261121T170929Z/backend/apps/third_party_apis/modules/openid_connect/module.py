from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "openid_connect"
    display_name = "OpenID Connect"
    description = "OpenID Connect identity layer published by the OpenID Foundation."
    default_source_name = "OpenID Foundation"
    owner = "OpenID Foundation"
    icon_path = ""
    upstream_provider = "OpenID Foundation"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Authentication", "OpenID Foundation")
    capabilities = ('Identity tokens', 'UserInfo', 'Discovery')
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
