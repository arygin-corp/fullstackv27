from django.apps import AppConfig


class ThirdPartyApisConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis"
    verbose_name = "Integrations"

    def ready(self):
        from .registry import registry
        registry.autodiscover()