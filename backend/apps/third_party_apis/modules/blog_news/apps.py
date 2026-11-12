from django.apps import AppConfig


class BlogNewsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.third_party_apis.modules.blog_news"
    label = "blog_news"
    verbose_name = "Newsroom"
