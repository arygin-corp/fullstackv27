from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "ldap_active_directory"
    display_name = "LDAP/Active Directory"
    description = "Active Directory and LDAP directory access published by Microsoft."
    default_source_name = "Microsoft"
    owner = "Microsoft"
    icon_path = ""
    upstream_provider = "Microsoft"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Authentication", "Microsoft")
    capabilities = ('Directory lookup', 'Bind', 'Groups')
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
