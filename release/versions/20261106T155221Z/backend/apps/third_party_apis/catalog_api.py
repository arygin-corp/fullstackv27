"""HTTP views for the third-party integration catalog."""

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.http import Http404, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET, require_POST

from .catalog import (
    integration_catalog,
    serialize_registered_integration,
)
from .registry import registry
from .sync import sync_installed_modules


def _registered_module_or_404(module_key):
    """Return a registered integration module or raise HTTP 404."""
    registry.autodiscover()

    try:
        module = registry.get(module_key)
    except (KeyError, LookupError):
        module = None

    if module is None:
        raise Http404("Integration not found")

    return module


@require_GET
@login_required
def integration_catalog_page(request):
    """Render the integration catalog page shell."""
    return render(
        request,
        "gdx_admin/apps/third_party_apis/integration_catalog.html",
    )


@require_GET
@login_required
def integration_catalog_api(request):
    """Return complete metadata for all registered integrations."""
    integrations = integration_catalog()

    return JsonResponse(
        {
            "count": len(integrations),
            "results": integrations,
            "is_staff": request.user.is_staff,
        }
    )


@require_GET
@login_required
def integration_detail_api(request, module_key):
    """Return complete metadata for one registered integration."""
    module = _registered_module_or_404(module_key)
    integration = serialize_registered_integration(module)

    return JsonResponse(
        {
            "result": integration,
        }
    )


@require_GET
@login_required
def integration_documentation_page(request, module_key):
    """Render documentation for one registered integration."""
    module = _registered_module_or_404(module_key)
    integration = serialize_registered_integration(module)

    return render(
        request,
        "gdx_admin/apps/third_party_apis/integration_documentation.html",
        {
            "integration": integration,
        },
    )


@staff_member_required
@require_POST
def sync_integrations(request):
    """Synchronize registered modules with installation records."""
    results = sync_installed_modules()

    created_count = sum(
        1
        for _module, created in results
        if created
    )
    existing_count = len(results) - created_count

    messages.success(
        request,
        (
            "Module sync complete. "
            f"{created_count} new module"
            f"{'' if created_count == 1 else 's'} added; "
            f"{existing_count} existing module"
            f"{'' if existing_count == 1 else 's'} checked."
        ),
    )

    return redirect(
        request.META.get(
            "HTTP_REFERER",
            "/sa/modules/integrations/",
        )
    )