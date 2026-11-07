"""Base interface for third-party integration modules."""


class ThirdPartyApiModule:
    # Identity
    key = ""
    display_name = ""
    description = ""
    default_source_name = ""
    icon_path = ""

    # Public application interface
    url_prefix = ""
    frontend_path = ""
    frontend_method = "GET"
    frontend_authentication = "Django authentication"

    # External provider interface
    upstream_provider = ""
    upstream_method = "GET"
    upstream_endpoint_setting = ""
    upstream_authentication = ""

    # Django settings required by the integration
    required_setting_names = ()
    required_secret_names = ()
    optional_setting_names = ()
    defaulted_settings = {}

    # Operational metadata
    cache_entries = ()
    default_config = {}

    # Discovery
    tags = ()
    capabilities = ()
    environments = ()

    # Governance
    owner = ""
    support_group = ""
    version = ""
    documentation_url = ""

    # Optional endpoint inventory
    endpoints = ()

    # Optional composite-module management
    management_route_name = ""
    managed_resources = ()

    # Module-specific UI
    presentation = {
        "card": {
            "fields": (),
        },
        "settings": {
            "sections": (),
        },
        "documentation": {
            "sections": (),
        },
    }

    @property
    def urlpatterns(self):
        return []

    def public_endpoint(self):
        """Return the application's public endpoint for this module."""
        if not self.frontend_path:
            return ""

        prefix = self.url_prefix.strip("/")
        path = self.frontend_path.lstrip("/")

        if prefix:
            return f"/api/integrations/{prefix}/{path}"

        return f"/api/integrations/{path}"

    def merged_config(self, database_config=None):
        """Merge module defaults with database configuration overrides."""
        return {
            **dict(self.default_config or {}),
            **dict(database_config or {}),
        }