from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "jenkins"
    display_name = "Jenkins"
    description = "Jenkins automation server published under the Continuous Delivery Foundation."
    default_source_name = "Continuous Delivery Foundation"
    owner = "Continuous Delivery Foundation"
    icon_path = ""
    upstream_provider = "Continuous Delivery Foundation"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("CI/CD", "Continuous Delivery Foundation")
    capabilities = ('Jobs', 'Pipelines', 'Agents')
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
