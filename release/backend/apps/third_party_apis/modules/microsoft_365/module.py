from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "microsoft_365"
    display_name = "Microsoft 365"
    description = "Microsoft 365 mail published by Microsoft."
    default_source_name = "Microsoft"
    owner = "Microsoft"
    icon_path = ""
    upstream_provider = "Microsoft"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Email", "Microsoft")
    capabilities = ('Send mail', 'Mailboxes', 'Exchange Online')
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
