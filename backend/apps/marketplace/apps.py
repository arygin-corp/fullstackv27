from django.apps import AppConfig


class MarketplaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.marketplace'
    verbose_name = 'Marketplace'

    def ready(self):
        # Register signal handlers only. Heavy ML models are loaded lazily.
        import apps.marketplace.signals  # noqa: F401
        from apps.marketplace.autostamp import connect_autostamp
        connect_autostamp()
