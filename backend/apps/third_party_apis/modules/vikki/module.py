from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "vikki"
    display_name = "Vikki"
    description = "GDX Marketplace RAG chat. Answers are generated from knowledge retrieved for the signed-in user."
    default_source_name = "GDX Marketplace"
    owner = "GDX Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    frontend_path = "api/ai/chat/"
    frontend_method = "POST"
    frontend_authentication = "Django authentication"
    upstream_provider = "AI Knowledge"
    upstream_method = "GET"
    upstream_authentication = "Django authentication"
    tags = ("Vikki", "GDX Marketplace")
    capabilities = ("RAG chat", "Learns new questions", "Reuses common answers", "Context", "Feedback")
    endpoints = (
        {
            "name": "Chat",
            "route_name": "chat:api-vikki-chat",
            "method": "POST",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Context",
            "route_name": "chat:api-vikki-context",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "Feedback",
            "route_name": "chat:api-vikki-feedback",
            "method": "POST",
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
        return "/api/ai/chat/"

    @property
    def urlpatterns(self):
        from .chat.urls import urlpatterns
        return urlpatterns


registry.register(Module())
