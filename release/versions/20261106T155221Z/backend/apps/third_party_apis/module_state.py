from .models import InstalledThirdPartyApi
def is_module_enabled(key): return InstalledThirdPartyApi.objects.filter(module_key=key,enabled=True).exists()
