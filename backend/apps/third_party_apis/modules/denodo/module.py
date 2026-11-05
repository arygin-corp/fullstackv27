from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "denodo"
    display_name = "Denodo Metadata Views"
    description = "Denodo Metadata Views"
    default_source_name = "Denodo"
    icon_path = "images/brands/modules/denodo.png"

    url_prefix = "denodo/"
    frontend_path = "table/view"

    upstream_provider = "Denodo"
    upstream_method = "GET"
    upstream_authentication = "OAuth 2.0 client credentials"
    upstream_endpoint_setting = "VIEWS_END_POINT"

    required_setting_names = (
        "VIEWS_END_POINT",
        "METADATA_VIEWS_AUTH_ENDPOINT",
        "METADATA_VIEWS_CLIENT_ID",
        "METADATA_VIEWS_X_CLIENT_ID",
        "METADATA_VIEWS_RESOURCE",
        "METADATA_VIEWS_GRANT_TYPE",
    )
    required_secret_names = ("METADATA_VIEWS_CLIENT_SECRET",)

    cache_entries = (
        ("Denodo token", "denodo_metadata_views_token"),
    )

    tags = ("Denodo Metadata Views",)
    owner = "<team or person>"
    support_group = "<support group>"
    version = "1.0.0"
    documentation_url = "<internal docs URL>"

    presentation = {
        "card": {
            "fields": (
                {
                    "label": "Provider",
                    "source": "upstream.provider",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Method",
                    "source": "upstream.method",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Configuration",
                    "source": "configuration.status",
                    "format": "status",
                    "hide_if_empty": True,
                },
                {
                    "label": "Last Health Check",
                    "source": "health.last_checked_at",
                    "format": "datetime",
                    "hide_if_empty": True,
                },
            ),
        },
        "settings": {
            "sections": (
                "status",
                "governance",
                "upstream",
                "capabilities",
                "configuration",
                "health",
            ),
        },
        "documentation": {
            "sections": (
                "governance",
                "capabilities",
                "environments",
                "upstream",
                "configuration",
                "health",
            ),
        },
    }


registry.register(Module())