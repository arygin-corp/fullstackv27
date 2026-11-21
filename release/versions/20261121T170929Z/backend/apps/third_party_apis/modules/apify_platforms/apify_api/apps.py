from django.apps import AppConfig

class ApifyConfig(AppConfig):
 default_auto_field='django.db.models.BigAutoField'
 name='apps.third_party_apis.modules.apify_platforms.apify_api'
 label='apify_api'
 verbose_name = 'APIFY Console'
 verbose_name_plural = 'APIFY Management Platform'
