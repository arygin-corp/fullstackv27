from django.db.models import Count,Q,Avg,F,DurationField,ExpressionWrapper
from apps.notifications.models import DynamicAudience,AudienceSnapshot,NotificationCampaign,CampaignRecipient,Notification,NotificationDelivery,NotificationFatigueAssessment,NotificationBundle
from .tenancy import get_current_tenant
def campaign_analytics():
    tenant=get_current_tenant();qs=NotificationCampaign.objects.all()
    if tenant is not None: qs=qs.filter(tenant=tenant)
    return qs.annotate(recipients_count=Count("recipients",distinct=True),delivered_count=Count("recipients__notification__deliveries",filter=Q(recipients__notification__deliveries__status="delivered"),distinct=True),read_count=Count("recipients__notification",filter=Q(recipients__notification__read=True),distinct=True),opened_count=Count("recipients__notification",filter=Q(recipients__notification__opened_at__isnull=False),distinct=True),clicked_count=Count("recipients__notification",filter=Q(recipients__notification__clicked_at__isnull=False),distinct=True),dismissed_count=Count("recipients__notification",filter=Q(recipients__notification__dismissed_at__isnull=False),distinct=True))
def audience_analytics():
    tenant=get_current_tenant();qs=DynamicAudience.objects.all()
    if tenant is not None: qs=qs.filter(tenant=tenant)
    return qs.annotate(snapshot_count=Count("snapshots",distinct=True),latest_size=Count("snapshots__members",distinct=True),campaign_count=Count("campaigns",distinct=True))
def fatigue_analytics():
    tenant=get_current_tenant();assess=NotificationFatigueAssessment.objects.all();bundles=NotificationBundle.objects.all()
    if tenant is not None: assess=assess.filter(notification__tenant=tenant);bundles=bundles.filter(notifications__tenant=tenant).distinct()
    return {"assessments":assess.count(),"suppressed":assess.filter(decision="suppress_duplicate").count(),"digested":assess.filter(decision="digest").count(),"reduced_channels":assess.filter(decision="reduce_channels").count(),"bypassed":assess.filter(decision="bypass").count(),"bundles":bundles.count(),"bundled_items":sum(b.item_count for b in bundles)}
def unread_aging():
    tenant=get_current_tenant();qs=Notification.objects.filter(read=False,is_deleted=False)
    if tenant is not None: qs=qs.filter(tenant=tenant)
    from django.utils import timezone
    from datetime import timedelta
    now=timezone.now();return {"under_24h":qs.filter(created_at__gte=now-timedelta(days=1)).count(),"one_to_three_days":qs.filter(created_at__lt=now-timedelta(days=1),created_at__gte=now-timedelta(days=3)).count(),"over_three_days":qs.filter(created_at__lt=now-timedelta(days=3)).count()}
