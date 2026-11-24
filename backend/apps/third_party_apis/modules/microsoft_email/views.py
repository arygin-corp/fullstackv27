import os

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count
from django.shortcuts import render

from apps.notifications.models import CampaignStatus, NotificationCampaign


def _mail_transport():
    backend = str(getattr(settings, "EMAIL_BACKEND", "") or "")
    if "console" in backend.lower():
        return "Console"
    if os.environ.get("EMAIL_HOST") or getattr(settings, "EMAIL_HOST", ""):
        return "SMTP"
    return "Not set"


def _present(name):
    value = os.environ.get(name)
    if value is None:
        value = getattr(settings, name, "")
    return bool(str(value or "").strip())


@staff_member_required
def dashboard(request):
    grouped = {
        row["status"]: row["total"]
        for row in NotificationCampaign.objects.values("status").annotate(total=Count("id"))
    }
    active_statuses = (
        CampaignStatus.PENDING_APPROVAL,
        CampaignStatus.APPROVED,
        CampaignStatus.SCHEDULED,
        CampaignStatus.SENDING,
    )
    campaigns = (
        NotificationCampaign.objects
        .select_related("template_version__template")
        .annotate(recipient_count=Count("recipients"))
        .order_by("-created_at")[:40]
    )
    return render(
        request,
        "gdx_admin/pages/microsoft_email/dashboard.html",
        {
            "counts": {
                "total": sum(grouped.values()),
                "draft": grouped.get(CampaignStatus.DRAFT, 0),
                "active": sum(grouped.get(status, 0) for status in active_statuses),
                "sent": grouped.get(CampaignStatus.SENT, 0),
                "failed": grouped.get(CampaignStatus.FAILED, 0),
            },
            "campaigns": campaigns,
            "transport": _mail_transport(),
            "sender_ready": _present("DEFAULT_FROM_EMAIL"),
            "microsoft_ready": _present("MICROSOFT_APP_ID") or bool(str((getattr(settings, "MICROSOFT_AUTH", {}) or {}).get("app_id") or "").strip()),
        },
    )
