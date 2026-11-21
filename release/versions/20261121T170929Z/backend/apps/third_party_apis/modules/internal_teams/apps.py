from django.apps import AppConfig


class InternalTeamConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis.modules.internal_teams"
    label = "internal_team"
    verbose_name = "Internal Team"
