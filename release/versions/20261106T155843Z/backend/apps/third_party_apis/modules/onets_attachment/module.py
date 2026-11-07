from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "onets_attachment"
    display_name = "OneTS Attachment"
    description = "OneTS attachment upload published by OneTS."
    default_source_name = "OneTS"
    owner = "OneTS"
    icon_path = ""
    upstream_provider = "OneTS"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Attachments", "OneTS")
    capabilities = ("Upload an attachment", "Attach a file to an order")
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
