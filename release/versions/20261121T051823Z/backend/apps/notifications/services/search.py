from django.db.models import Q
from django.utils import timezone
from apps.notifications.models import Notification
from .tenancy import get_current_application, get_current_tenant

def search_notifications(*, user, query="", filters=None, operator=False):
    filters=filters or {}; tenant=get_current_tenant(); application=get_current_application()
    qs=Notification.objects.active().select_related("tenant","application","recipient")
    if tenant is not None: qs=qs.filter(tenant=tenant)
    if application is not None: qs=qs.filter(application=application)
    if not operator: qs=qs.filter(recipient=user)
    if query: qs=qs.filter(Q(title__icontains=query)|Q(body__icontains=query)|Q(source_object_id__icontains=query)|Q(correlation_id__icontains=query))
    for k,v in filters.items():
        if k in {"notification_type","application_id","source_object_type","lifecycle","pinned","action_required"} and v not in (None,""): qs=qs.filter(**{k:v})
    if not filters.get("lifecycle"): qs=qs.exclude(lifecycle="archived")
    return qs.exclude(lifecycle="snoozed",snoozed_until__gt=timezone.now()).order_by("-pinned","-created_at","-id")
