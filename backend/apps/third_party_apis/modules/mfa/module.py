from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "mfa"
    display_name = "MFA"
    description = "Multi-factor authentication supplied by an external identity provider."
    default_source_name = "Identity providers"
    owner = "Identity providers"
    icon_path = ""
    upstream_provider = "Identity providers"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Authentication", "Identity providers")
    capabilities = ('One-time codes', 'Push approval', 'Step-up authentication')
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
