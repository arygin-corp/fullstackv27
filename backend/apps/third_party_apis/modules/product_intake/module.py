from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "product_intake"
    display_name = "Product Intake"
    description = (
        "GDX Data Marketplace product intake: draft a product request, submit it for review, "
        "approve or reject it, and activate the linked marketplace product."
    )
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    url_prefix = ""
    frontend_path = "api/new/product/intake/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Product Intake", "GDX Data Marketplace", "Workflow")
    capabilities = (
        "Draft a product request",
        "Submit for review",
        "Approve or reject",
        "Activate the marketplace product",
    )
    endpoints = (
        {
            "name": "List requests",
            "route_name": "intake:intake-list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Create request",
            "route_name": "intake:intake-list",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("product_name", "product_desc", "marketplace_domain", "marketplace_datatype"),
        },
        {
            "name": "Submit request",
            "route_name": "intake:intake-submit",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk",),
        },
        {
            "name": "Approve request",
            "route_name": "intake:intake-approve",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk", "reason"),
        },
        {
            "name": "Add draft product",
            "route_name": "intake:intake-create-draft-product",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk", "reason"),
        },
        {
            "name": "Curate product",
            "route_name": "intake:intake-curate-product",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk", "reason"),
        },
        {
            "name": "Reject request",
            "route_name": "intake:intake-reject",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk", "reason", "comments"),
        },
        {
            "name": "Activate marketplace product",
            "route_name": "intake:intake-activate-product",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("pk", "reason"),
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
        return "/api/new/product/intake/"

    @property
    def urlpatterns(self):
        from .urls import urlpatterns

        return urlpatterns


registry.register(Module())
