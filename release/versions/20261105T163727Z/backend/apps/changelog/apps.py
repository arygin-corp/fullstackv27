from django.apps import AppConfig

class ChangelogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.changelog"
    label = "changelog"
    verbose_name = "Changelog"

    def ready(self):
        from . import signals  # noqa: F401
