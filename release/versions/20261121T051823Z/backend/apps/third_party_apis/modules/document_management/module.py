from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "document_management"
    display_name = "Document Management"
    description = "Document storage supplied by an external document-management product."
    default_source_name = "External document provider"
    owner = "External document provider"
    icon_path = ""
    upstream_provider = "External document provider"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Documents", "External document provider")
    capabilities = ('Upload', 'Organize', 'Retrieve')
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
