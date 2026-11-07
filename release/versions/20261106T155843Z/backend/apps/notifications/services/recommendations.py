from datetime import timedelta
from django.db.models import Count
from django.utils import timezone
from apps.notifications.models import Notification, NotificationRecommendation
from .tenancy import get_current_tenant

def generate_user_recommendations(user):
    tenant=get_current_tenant(); qs=Notification.objects.for_user(user).active().filter(created_at__gte=timezone.now()-timedelta(days=30))
    if tenant is not None: qs=qs.filter(tenant=tenant)
    out=[]
    for row in qs.values("application_id","application__name").annotate(total=Count("id")).filter(total__gte=20):
        out.append(NotificationRecommendation.objects.create(tenant=tenant,application_id=row["application_id"],recipient=user,recommendation_type="digest",subject=f"Move frequent {row['application__name']} updates to a digest",evidence=[{"notifications_last_30_days":row["total"]}],expected_benefit="Reduce individual deliveries",confidence=min(0.95,0.6+row["total"]/200),proposed_action={"digest_frequency":"daily"}))
    return out
