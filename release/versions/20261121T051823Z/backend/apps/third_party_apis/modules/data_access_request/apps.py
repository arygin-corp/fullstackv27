from django.apps import AppConfig


class DataAccessRequestConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis.modules.data_access_request"
    label = "data_access_request"
    verbose_name = "Data Access Request (DAR)"

    def ready(self):
        from .audit import register_audit_signals
        register_audit_signals()
