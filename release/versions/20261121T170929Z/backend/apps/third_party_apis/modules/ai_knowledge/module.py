from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "ai_knowledge"
    display_name = "AI Knowledge"
    description = "GDX Data Marketplace knowledge from files and notes uploaded for Vikki learning."
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    frontend_path = "api/ai/chat/documents/search/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("AI Knowledge", "GDX Data Marketplace")
    capabilities = ("Search documents", "Search entities", "List memories", "Learn from uploaded files", "Learn from written notes")
    endpoints = (
        {
            "name": "Search documents",
            "route_name": "chat:api-document-search",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("q",),
        },
        {
            "name": "Search entities",
            "route_name": "chat:api-entities",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": ("q",),
        },
        {
            "name": "List memories",
            "route_name": "chat:api-memories",
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
        return "/api/ai/chat/documents/search/"

    @property
    def urlpatterns(self):
        from .knowledge import knowledge_routes
        return knowledge_routes()


registry.register(Module())
