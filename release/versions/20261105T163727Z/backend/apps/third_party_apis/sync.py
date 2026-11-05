from .models import InstalledThirdPartyApi
from .registry import registry


def sync_installed_modules():
    registry.autodiscover()

    results = []

    for module in registry.all():
        obj, created = InstalledThirdPartyApi.objects.get_or_create(
            module_key=module.key,
            defaults={
                "name": module.display_name,
                "description": module.description,
                "source_name": module.default_source_name,
                "enabled": False,
                "config": {},
            },
        )

        results.append((obj, created))

    return results