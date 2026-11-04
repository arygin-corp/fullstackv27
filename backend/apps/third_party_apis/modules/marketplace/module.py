from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class MarketplaceModule(ThirdPartyApiModule):
    key = "marketplace"
    display_name = "Data Marketplace"
    description = "GDX Data Marketplace administration, catalog, governance, search, taxonomy, reviews, and product operations."
    default_source_name = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    url_prefix = "marketplace/"
    frontend_path = ""
    frontend_method = "GET + POST"
    frontend_authentication = "Django authentication and Marketplace permissions"
    upstream_provider = "Internal Marketplace application"
    upstream_method = "Internal"
    upstream_endpoint_setting = ""
    upstream_authentication = "Django application permissions"
    required_setting_names = ()
    required_secret_names = ()
    optional_setting_names = ()
    defaulted_settings = {}
    cache_entries = ()
    default_config = {}
    tags = ("Marketplace", "Catalog", "Governance", "Search")
    documentation_url = ""

    @property
    def urlpatterns(self):
        return []


registry.register(MarketplaceModule())
