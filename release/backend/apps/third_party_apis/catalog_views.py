from django.contrib.auth.decorators import login_required
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET
from .catalog import integration_catalog, serialize_integration
from .models import InstalledThirdPartyApi
from .registry import registry
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect
from django.views.decorators.http import require_POST
from .sync import sync_installed_modules

@require_GET
@login_required
def integration_catalog_page(request): return render(request,"gdx_admin/apps/third_party_apis/integration_catalog.html")
@require_GET
@login_required
def integration_catalog_api(request):
    rows=integration_catalog();return JsonResponse({"count":len(rows),"results":rows,"is_staff":request.user.is_staff})
@require_GET
@login_required
def integration_documentation_page(request,module_key):
    registry.autodiscover();row=InstalledThirdPartyApi.objects.filter(module_key=module_key).first()
    if row is None: raise Http404("Integration not found")
    return render(request,"gdx_admin/apps/third_party_apis/integration_documentation.html",{"integration":serialize_integration(row)})


@staff_member_required
@require_POST
def sync_integrations(request):
    results = sync_installed_modules()

    created_count = sum(
        1
        for _, created in results
        if created
    )

    existing_count = (
        len(results) - created_count
    )

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