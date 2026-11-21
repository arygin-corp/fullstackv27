from django.apps import AppConfig


class AWSConfig(AppConfig):
    name = "apps.third_party_apis.modules.aws"
    label = "third_party_apis_aws"
    verbose_name = "AWS Integration Catalog"

    def ready(self):
        # Importing services registers each service adapter exactly once.
        from . import services  # noqa: F401
