from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "kubernetes"
    display_name = "Kubernetes"
    description = "Kubernetes orchestration published by the Cloud Native Computing Foundation."
    default_source_name = "Cloud Native Computing Foundation"
    owner = "Cloud Native Computing Foundation"
    icon_path = ""
    upstream_provider = "Cloud Native Computing Foundation"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Containers", "Cloud Native Computing Foundation")
    capabilities = ('Clusters', 'Workloads', 'Services')
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


registry.register(Module())
