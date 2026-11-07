from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.notifications"
    label = "notifications"
    verbose_name = "Notifications"

    def ready(self):
        try:
            from .telemetry import configure_telemetry
            configure_telemetry()
        except ImportError:
            pass
        try:
            from .services.work import autodiscover_work_adapters
            autodiscover_work_adapters()
        except ImportError:
            pass
