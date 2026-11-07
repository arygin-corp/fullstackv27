from django.apps import AppConfig


class DataMarketplaceCheckoutConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis.modules.checkout"
    label = "data_marketplace_checkout"
    verbose_name = "Data Marketplace Checkout"