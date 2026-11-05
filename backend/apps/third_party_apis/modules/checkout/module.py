from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "data_marketplace_checkout"
    display_name = "Checkout"
    description = (
        "Renders the marketplace request-access form for a product and submits "
        "one open cart to 1TS ServiceNow."
    )

    default_source_name = "Data Marketplace / 1TS"
    icon_path = "images/brands/modules/data-marketplace.png"

    url_prefix = ""
    frontend_path = "api/marketplace/cart/checkout/"
    frontend_method = "POST"
    frontend_authentication = "Django authentication"

    upstream_provider = "1TS ServiceNow"
    upstream_method = "POST"
    upstream_endpoint_setting = "ONETS_ADD_TO_CART_URL"
    upstream_authentication = (
        "Server-side Basic authentication or approved secret-backed credentials"
    )

    required_setting_names = (
        "ONETS_ADD_TO_CART_URL",
        "ONETS_SUBMIT_CART_URL",
        "ONETS_USERNAME",
        "ONETS_PASSWORD",
    )

    required_secret_names = (
        "ONETS_USERNAME",
        "ONETS_PASSWORD",
    )

    optional_setting_names = (
        "ONETS_TIMEOUT_SECONDS",
    )

    defaulted_settings = {
        "ONETS_TIMEOUT_SECONDS": 30,
    }

    cache_entries = ()
    default_config = {}

    tags = (
        "Data Marketplace",
        "Checkout",
        "Request Form",
        "1TS",
    )

    capabilities = (
        "Product request form",
        "Cart item request form",
        "1TS cart submission",
    )

    documentation_url = ""

    endpoints = (
        {
            "name": "Product request form",
            "route_name": "data_marketplace_checkout:product_request_form",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("product_id",),
        },
        {
            "name": "Cart item request form",
            "route_name": "data_marketplace_checkout:cart_item_request_form",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("line_key",),
        },
        {
            "name": "Save cart item request form",
            "route_name": "data_marketplace_checkout:cart_item_request_form",
            "method": "PUT",
            "authentication": "Django authentication",
            "parameters": ("line_key", "revision", "form_values"),
        },
        {
            "name": "Current cart",
            "route_name": "data_marketplace_checkout:current_cart",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Submit checkout",
            "route_name": "data_marketplace_checkout:checkout",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("cart_id", "idempotency_key", "terms_accepted"),
        },
        {
            "name": "Checkout detail",
            "route_name": "data_marketplace_checkout:checkout_detail",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("checkout_id",),
        },
    )

    presentation = {
        "card": {
            "fields": (
                {
                    "label": "Endpoint",
                    "source": "frontend.endpoint",
                    "format": "code",
                    "hide_if_empty": True,
                },
                {
                    "label": "Method",
                    "source": "frontend.method",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Auth Type",
                    "source": "frontend.authentication",
                    "format": "text",
                    "hide_if_empty": True,
                },
                {
                    "label": "Last Sync",
                    "source": "last_success_at",
                    "format": "datetime",
                    "hide_if_empty": True,
                },
            ),
        },
        "settings": {
            "sections": (
                "status",
                "governance",
                "frontend",
                "upstream",
                "configuration",
                "health",
            ),
        },
        "documentation": {
            "sections": (
                "governance",
                "capabilities",
                "endpoints",
                "frontend",
                "upstream",
                "configuration",
                "health",
            ),
        },
    }

    def public_endpoint(self):
        return "/api/marketplace/cart/checkout/"

    @property
    def urlpatterns(self):
        from .urls import urlpatterns

        return urlpatterns

registry.register(Module())