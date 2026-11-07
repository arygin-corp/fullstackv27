from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from .catalog import catalog
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect
from django.views.decorators.http import require_POST

from .sync import sync_installed_modules

@login_required
def catalog_page(request):
    return render(request,"gdx_admin/apps/third_party_apis/integration_catalog.html")

@login_required
def catalog_api(request):
    rows=catalog();

    return JsonResponse({"count":len(rows),"results":rows,"is_staff":request.user.is_staff})


@staff_member_required
@require_POST
def sync_integrations(request):
    results = sync_installed_modules()

    created = sum(
        1
        for _, was_created in results
        if was_created
    )

    updated = len(results) - created

    messages.success(
        request,
        (
            f"Integration sync complete. "
            f"{created} new module"
            f"{'' if created == 1 else 's'} added; "
            f"{updated} existing module"
            f"{'' if updated == 1 else 's'} checked."
        ),
    )

    return redirect("third_party_apis:index")