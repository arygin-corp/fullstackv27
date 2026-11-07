from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import InstalledThirdPartyApi

@receiver(post_save, sender=InstalledThirdPartyApi, dispatch_uid="third_party_apis.clear_config_cache")
def clear_config_cache(sender, instance, **kwargs):
    from django.core.cache import cache
    cache.delete(f"third_party_apis:module:{instance.module_key}")
