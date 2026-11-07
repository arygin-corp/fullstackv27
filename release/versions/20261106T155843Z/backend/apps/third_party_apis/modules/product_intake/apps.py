from django.apps import AppConfig


class ProductIntakeConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis.modules.product_intake"
    label = "intake"
    verbose_name = "GDX Data Marketplace Product Intake"

    def ready(self):
        from . import checks  # noqa: F401
