from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "axon"
    display_name = "Axon Facet Search"
    description = "Axon glossary facet search"
    default_source_name = "Axon"
    icon_path = "images/brands/modules/data-marketplace.png"

    url_prefix = "view/endpoint/axon/"
    frontend_path = "axon-facet-search"
    frontend_method = "GET"
    frontend_authentication = "None"

    upstream_provider = "Axon"
    upstream_method = "POST"
    upstream_authentication = "OAuth 2.0 client credentials"
    upstream_endpoint_setting = "AXON_FACETSEARCH_END_POINT"

    required_setting_names = (
        "AXON_END_POINT",
        "AXON_CLIENT_ID",
        "AXON_GRANT_TYPE",
        "AXON_RESOURCE",
        "AXON_FACETSEARCH_END_POINT",
        "AXON_FACETSEARCH_X_CLIENT_ID",
    )
    required_secret_names = ("AXON_CLIENT_SECRET",)

    cache_entries = (("Axon token", "axon_facet_search_token"),)

    tags = ("Axon Facet Search",)
    owner = "Data Marketplace Team"
    support_group = "Data Marketplace Team"
    version = "1.0.0"
    documentation_url = ""


registry.register(Module())
