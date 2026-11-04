from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "data_marketplace_checkout"
    display_name = "Checkout"
    description = (
        "Multi-product Marketplace checkout with one final 1TS submission."
    )

    default_source_name = "Data Marketplace / 1TS"
    icon_path = "images/brands/modules/data-marketplace.png"

    url_prefix = "data-marketplace-checkout/"
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
        "1TS",
        "Multi-product",
    )

    documentation_url = ""

    presentation = {
        "card": {
            "fields": (
                {
                    "label": "Checkout API",
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
                    "label": "Last Submission",
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

    @property
    def urlpatterns(self):
        from .urls import urlpatterns

        return urlpatterns

registry.register(Module())