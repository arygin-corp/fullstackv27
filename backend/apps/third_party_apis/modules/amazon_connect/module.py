from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "amazon_connect"
    display_name = "Amazon Connect"
    description = "Amazon Connect contact center published by Amazon Web Services."
    default_source_name = "Amazon Web Services"
    owner = "Amazon Web Services"
    icon_path = ""
    upstream_provider = "Amazon Web Services"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Voice", "Amazon Web Services")
    capabilities = ('Inbound calls', 'Outbound calls', 'Contact flows')
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
