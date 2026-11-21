from django.contrib.admin.views.decorators import (
    staff_member_required,
)
from django.shortcuts import (
    get_object_or_404,
    render,
)
from django.urls import reverse

from .models import (
    InstalledThirdPartyApi,
)


@staff_member_required
def integration_test_dashboard(request):
    modules = (
        InstalledThirdPartyApi.objects
        .order_by(
            "name"
        )
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "integration_test_dashboard.html"
        ),
        {
            "modules": modules,
        },
    )


@staff_member_required
def integration_test(request, module_key):
    module = get_object_or_404(
        InstalledThirdPartyApi,
        module_key=module_key,
    )

    latest = (
        module.test_runs
        .order_by(
            "-started_at"
        )
        .first()
    )

    run_url = reverse(
        "third_party_api:integration_test_run",
        kwargs={
            "module_key": module_key,
        },
    )

    return render(
        request,
        (
            "gdx_admin/pages/"
            "third_party_apis/"
            "integration_test.html"
        ),
        {
            "module": module,
            "latest": latest,
            "run_url": run_url,
        },
    )