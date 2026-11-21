from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "pages"
    display_name = "Pages"
    description = "GDX Data Marketplace pages, including lookup by slug and the public page API."
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    frontend_path = "api/pages/pages/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Pages", "GDX Data Marketplace")
    capabilities = ("List pages", "Page by slug", "Public page by slug")
    endpoints = (
        {
            "name": "List pages",
            "route_name": "master-page-list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Page by slug",
            "route_name": "page-by-slug",
            "method": "GET",
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
        return "/api/pages/pages/"


registry.register(Module())
