from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "internal_teams"
    display_name = "Internal Teams"
    description = "Organize marketplace staff into internal teams."
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Internal Teams", "GDX Data Marketplace")
    capabilities = ('Teams', 'Membership', 'Ownership')
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

    def public_endpoint(self):
        return "/sa/teams/"


registry.register(Module())
