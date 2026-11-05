from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "orders"
    display_name = "Orders"
    description = "OneTS orders: the order list, order detail, and order tracking."
    default_source_name = "OneTS"
    owner = "OneTS"
    icon_path = "images/brands/modules/servicenow.png"
    frontend_path = "api/orders/orders/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "OneTS"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Orders", "OneTS")
    capabilities = ("List orders", "Order detail", "Track an order")
    endpoints = (
        {
            "name": "List orders",
            "route_name": "orders-admin:order-list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Track order",
            "route_name": "orders-admin:track-order",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
    )
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
        return "/api/orders/orders/"


registry.register(Module())
