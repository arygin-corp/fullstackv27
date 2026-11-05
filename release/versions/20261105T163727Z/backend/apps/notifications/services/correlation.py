from apps.notifications.models import Notification,NotificationEvent,NotificationOutbox,NotificationAuditEvent,NotificationDelivery,NotificationDeadLetter,AuditLedgerEntry
from .tenancy import get_current_tenant
def explore(correlation_id,*,user=None,operator=False):
    tenant=get_current_tenant();n=Notification.objects.filter(correlation_id=correlation_id)
    if tenant is not None: n=n.filter(tenant=tenant)
    if not operator and user is not None: n=n.filter(recipient=user)
    ids=list(n.values_list("id",flat=True));base={"notifications":n.select_related("application","recipient"),"events":NotificationEvent.objects.filter(correlation_id=correlation_id),"audit_events":NotificationAuditEvent.objects.filter(correlation_id=correlation_id,notification_id__in=ids),"deliveries":NotificationDelivery.objects.filter(notification_id__in=ids),"outbox":NotificationOutbox.objects.filter(notification_id__in=ids),"dead_letters":NotificationDeadLetter.objects.filter(notification_id__in=ids),"ledger":AuditLedgerEntry.objects.filter(correlation_id=correlation_id)}
    return base
