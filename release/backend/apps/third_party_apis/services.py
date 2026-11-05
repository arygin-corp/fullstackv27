from django.utils import timezone
from .models import InstalledThirdPartyApi
from .registry import registry
def get_module_config(key):
    module=registry.get(key);row=InstalledThirdPartyApi.objects.get(module_key=key)
    if not row.enabled:raise PermissionError(f"Integration {key} is disabled")
    return module.merged_config(row.config)
def mark_success(key):InstalledThirdPartyApi.objects.filter(module_key=key).update(last_success_at=timezone.now())
