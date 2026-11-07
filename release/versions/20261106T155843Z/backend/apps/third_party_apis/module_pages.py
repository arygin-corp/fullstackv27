"""Pages that belong to every registered integration module."""

from django.http import Http404
from django.urls import reverse

from .registry import registry


MODULE_PAGES = (
    ("dashboard", "Dashboard"),
    ("analytics", "Analytics"),
    ("health", "Health"),
    ("audit", "Audit"),
    ("activity", "Activity"),
    ("report", "Report"),
)


def module_page_links(module_key):
    """Return the standard page links for one module key."""
    return [
        {
            "key": key,
            "label": label,
            "url": reverse(
                f"third_party_api_ops:module_{key}",
                kwargs={"module_key": module_key},
            ),
        }
        for key, label in MODULE_PAGES
    ]


def registered_module(module_key):
    """Return a registered module, or 404 when the key is unknown."""
    registry.autodiscover()
    try:
        module = registry.get(module_key)
    except KeyError:
        module = None
    if module is None:
        raise Http404("Integration not found")
    return module
