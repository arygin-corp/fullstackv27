from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "microsoft_sql_server"
    display_name = "Microsoft SQL Server"
    description = "SQL Server database published by Microsoft."
    default_source_name = "Microsoft"
    owner = "Microsoft"
    icon_path = ""
    upstream_provider = "Microsoft"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Database", "Microsoft")
    capabilities = ('Connections', 'Schemas', 'Queries')
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
