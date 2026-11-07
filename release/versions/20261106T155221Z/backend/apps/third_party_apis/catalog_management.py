"""Helpers for exposing composite-module management metadata to catalog JSON."""

from django.urls import NoReverseMatch, reverse

LARGE_RESOURCE_THRESHOLD = 3


def composite_management_metadata(module):
    """Return catalog fields used by the three-dot composite management action."""
    resource_count = _managed_resource_count(module)
    route_name = getattr(module, "management_route_name", None)
    management_url = None

    if resource_count >= LARGE_RESOURCE_THRESHOLD and route_name:
        try:
            management_url = reverse(route_name)
        except NoReverseMatch:
            management_url = None

    return {
        "managed_resource_count": resource_count,
        "module_management_url": management_url,
    }


def _managed_resource_count(module):
    explicit = getattr(module, "managed_resource_count", None)
    if explicit is not None:
        try:
            return max(0, int(explicit))
        except (TypeError, ValueError):
            return 0

    resources = getattr(module, "managed_resources", None)
    if resources is None:
        return 0

    try:
        return len(resources)
    except TypeError:
        return sum(1 for _item in resources)
