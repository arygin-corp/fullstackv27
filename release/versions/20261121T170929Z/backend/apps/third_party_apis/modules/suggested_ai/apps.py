from django.apps import AppConfig

class SuggestedaIConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.suggestedAI' # Ensure this matches your folder structure

    def ready(self):
        import apps.suggestedAI.signals  # This line "activates" the logic