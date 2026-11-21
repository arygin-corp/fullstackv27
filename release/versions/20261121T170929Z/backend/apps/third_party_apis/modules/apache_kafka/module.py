from apps.third_party_apis.interfaces import ThirdPartyApiModule
from apps.third_party_apis.registry import registry


class Module(ThirdPartyApiModule):
    key = "apache_kafka"
    display_name = "Apache Kafka Service"
    description = "Apache Kafka event streaming published by the Apache Software Foundation."
    default_source_name = "Apache Software Foundation"
    owner = "Apache Software Foundation"
    icon_path = ""
    upstream_provider = "Apache Software Foundation"
    upstream_method = "Not connected"
    upstream_authentication = ""
    tags = ("Messaging", "Apache Software Foundation")
    capabilities = ('Topics', 'Producers', 'Consumers')
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
