from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "workflow_engine"
    display_name = "Workflow Engine"
    description = "GDX Data Marketplace workflow engine: workflow list, builder, runs, and audit."
    default_source_name = "GDX Data Marketplace"
    owner = "GDX Data Marketplace"
    icon_path = "images/brands/modules/data-marketplace.png"
    frontend_path = "api/workflow/workflows/"
    frontend_method = "GET"
    frontend_authentication = "Django authentication"
    upstream_provider = "GDX Data Marketplace"
    upstream_method = "Internal"
    upstream_authentication = "Django authentication"
    tags = ("Workflow Engine", "GDX Data Marketplace")
    capabilities = ("List workflows", "Open a workflow", "Review runs")
    endpoints = (
        {
            "name": "List workflows",
            "route_name": "workflow_api:list",
            "method": "GET",
            "authentication": "Django authentication",
            "parameters": (),
        },
        {
            "name": "List runs",
            "route_name": "workflow_api:runs",
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
        return "/api/workflow/workflows/"


registry.register(Module())
