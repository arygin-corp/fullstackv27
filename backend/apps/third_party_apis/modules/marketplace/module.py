from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry

_RESOURCE_APIS = (
    ("Subdomains", "api-subdomains"),
    ("Subdomain groups", "api-subdomain-groups"),
    ("Datatypes", "api-datatypes"),
    ("Classifications", "api-classifications"),
    ("Contacts", "api-contacts"),
    ("Catalogs", "api-catalogs"),
    ("Badges", "api-badges"),
    ("Platforms", "api-platforms"),
    ("Organizations", "api-organizations"),
    ("Companies", "api-companies"),
    ("Data stewards", "api-data-stewards"),
    ("Keywords", "api-keywords"),
    ("Attribute types", "api-attribute-types"),
    ("Attributes", "api-attributes"),
    ("OneTS domains", "api-onets-domains"),
    ("AD groups", "api-ad-groups"),
    ("Fulfillment teams", "api-fulfillment-teams"),
    ("Product images", "api-product-images"),
    ("Product associations", "api-product-associations"),
    ("End-to-end products", "api-end-to-end-products"),
    ("Synonyms", "api-synonyms"),
    ("Search logs", "api-search-logs"),
    ("Reviews", "api-reviews"),
    ("Search embeddings", "api-search-embeddings"),
)


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
    capabilities = (
        "List products",
        "List domains",
        "Search products",
        "Search suggestions",
        "List marketplace resources",
    )
    documentation_url = ""
    endpoints = (
        {
            "name": "List products",
            "route_name": "marketplace:api-products-list",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": (),
        },
        {
            "name": "Product detail",
            "route_name": "marketplace:api-products-detail",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": ("pk",),
        },
        {
            "name": "List domains",
            "route_name": "marketplace:api-domains-list",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": (),
        },
        {
            "name": "Search products",
            "route_name": "marketplace:product-search-list",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": (),
        },
        {
            "name": "Search suggestions",
            "route_name": "marketplace:search-suggestions-list",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": (),
        },
    ) + tuple(
        {
            "name": name,
            "route_name": f"marketplace:{basename}-list",
            "method": "GET",
            "authentication": "Django authentication and Marketplace permissions",
            "parameters": (),
        }
        for name, basename in _RESOURCE_APIS
    )

    def public_endpoint(self):
        return "/marketplace/api/products/"

    @property
    def urlpatterns(self):
        from apps.marketplace.urls import urlpatterns

        return urlpatterns


registry.register(MarketplaceModule())
