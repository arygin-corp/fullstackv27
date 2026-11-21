from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST
from apps.notifications.models import Notification
from django.views.decorators.http import require_GET
from apps.notifications.services.search import search_notifications


def serialize(n):
    return {
        "id": n.pk,
        "title": n.title,
        "type": n.notification_type,
        "read": n.read,
        "created_at": n.created_at.isoformat(),
    }


@login_required
@require_GET
def list_notifications(request):
    qs = Notification.objects.for_user(request.user).active()
    typ = request.GET.get("type")
    if typ:
        qs = qs.filter(notification_type=typ)
    return JsonResponse(
        {
            "api_version": "v1",
            "count": qs.count(),
            "results": [serialize(n) for n in qs[:100]],
        }
    )


def owned(request, pk):
    return get_object_or_404(Notification.objects.for_user(request.user), pk=pk)


@login_required
@require_POST
def open_notification(request, notification_id):
    n = owned(request, notification_id)
    n.opened_at = timezone.now()
    n.save(update_fields=["opened_at", "updated_at"])
    return JsonResponse({"success": True})


@login_required
@require_POST
def click_notification(request, notification_id):
    n = owned(request, notification_id)
    n.clicked_at = timezone.now()
    n.save(update_fields=["clicked_at", "updated_at"])
    return JsonResponse({"success": True})


@login_required
@require_POST
def dismiss_notification(request, notification_id):
    n = owned(request, notification_id)
    n.dismissed_at = timezone.now()
    n.is_deleted = True
    n.deleted_at = timezone.now()
    n.save(update_fields=["dismissed_at", "is_deleted", "deleted_at", "updated_at"])
    return JsonResponse({"success": True})


@login_required
@require_GET
def analytics(request):
    qs = Notification.objects.for_user(request.user)
    return JsonResponse(
        {
            "opened": qs.filter(opened_at__isnull=False).count(),
            "clicked": qs.filter(clicked_at__isnull=False).count(),
            "dismissed": qs.filter(dismissed_at__isnull=False).count(),
        }
    )


@login_required
@require_GET
def search(request):
    return JsonResponse(
        {
            "results": [
                {"id": n.pk, "title": n.title, "correlation_id": str(n.correlation_id)}
                for n in search_notifications(
                    user=request.user, query=request.GET.get("q", "")
                )[:100]
            ]
        }
    )











