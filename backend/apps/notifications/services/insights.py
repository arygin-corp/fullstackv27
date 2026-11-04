from apps.notifications.models import CommunicationInsight
from .tenancy import get_current_tenant
from .domain_analytics import fatigue_analytics,unread_aging
def generate_insights():
    tenant=get_current_tenant();created=[];fatigue=fatigue_analytics();aging=unread_aging()
    created.append(CommunicationInsight.objects.create(tenant=tenant,insight_type="fatigue",title="Notification fatigue controls",summary=f"{fatigue['suppressed']} duplicates suppressed and {fatigue['bundled_items']} items bundled.",evidence=[fatigue]))
    if aging["over_three_days"]:
        created.append(CommunicationInsight.objects.create(tenant=tenant,insight_type="unread_aging",title="Aged unread notifications",summary=f"{aging['over_three_days']} unread notifications are older than three days.",evidence=[aging],severity="warning"))
    return created
