from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "data_access_request"
    display_name = "Data Access Request (DAR)"
    description = (
        "GDX Data Marketplace data access requests: published form schema, "
        "current field state, preflight, and submission."
    )
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    url_prefix = "data-access-request/"
    frontend_path = "<slug>/schema/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("DAR", "Data Marketplace", "Forms")
    capabilities = (
        "Form schema",
        "Form state",
        "Preflight",
        "Submit request",
    )
    endpoints = (
        {
            "name": "Form schema",
            "route_name": "data_access_request:form-schema",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("slug",),
        },
        {
            "name": "Form state",
            "route_name": "data_access_request:form-state",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("slug",),
        },
        {
            "name": "Preflight",
            "route_name": "data_access_request:form-preflight",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("slug",),
        },
        {
            "name": "Submit request",
            "route_name": "data_access_request:form-submit",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": ("slug",),
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
        return "/api/integrations/data-access-request/<slug>/schema/"

    @property
    def urlpatterns(self):
        from .urls import urlpatterns
        return urlpatterns


registry.register(Module())
