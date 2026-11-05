from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "mailgun"
    display_name = "Mailgun"
    description = "Mailgun email delivery published by Sinch."
    default_source_name = "Sinch"
    owner = "Sinch"
    icon_path = ""
    upstream_provider = "Sinch"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Email", "Sinch")
    capabilities = ('Send mail', 'Domains', 'Delivery events')
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
