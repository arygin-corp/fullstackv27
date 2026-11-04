from django.apps import AppConfig


class FormsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.intake"
    verbose_name = "New Product Request"

    def ready(self):
        from . import checks  # noqa: F401
