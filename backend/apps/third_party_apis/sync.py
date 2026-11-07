from .models import InstalledThirdPartyApi
from .registry import registry


def ensure_installed_module(module_key):
    """Return the installation row, creating it from the registered module when missing."""
    row = InstalledThirdPartyApi.objects.filter(module_key=module_key).first()
    if row is not None:
        return row
    registry.autodiscover()
    try:
        module = registry.get(module_key)
    except KeyError:
        return None
    row, _created = InstalledThirdPartyApi.objects.get_or_create(
        module_key=module.key,
        defaults={
            "name": module.display_name,
            "description": module.description,
            "source_name": module.default_source_name,
            "enabled": False,
            "config": {},
        },
    )
    return row


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