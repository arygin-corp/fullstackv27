from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from apps.third_party_apis.modules.google_analytics.connection import (
    disconnect,
    public_connection,
    save_connection,
    test_connection,
)


@staff_member_required
@require_http_methods(["GET", "POST"])
def dashboard(request):
    message = ""
    if request.method == "POST":
        action = request.POST.get("action") or "save"
        if action == "disconnect":
            _, message = disconnect()
        elif action == "test":
            _, message = test_connection()
        else:
            upload = request.FILES.get("credentials")
            raw = upload.read().decode("utf-8") if upload else ""
            _, message = save_connection(request.POST.get("property_id"), raw)
    return render(
        request,
        "gdx_admin/apps/google_analytics/dashboard.html",
        {"connection": public_connection(), "message": message},
    )
