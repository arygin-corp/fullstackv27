from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "mongodb"
    display_name = "MongoDB"
    description = "MongoDB database published by MongoDB, Inc."
    default_source_name = "MongoDB"
    owner = "MongoDB"
    icon_path = ""
    upstream_provider = "MongoDB"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Database", "MongoDB")
    capabilities = ('Connections', 'Collections', 'Queries')
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
