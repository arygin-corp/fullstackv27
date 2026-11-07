from django.db.models import Count,Q
from apps.notifications.models import NotificationRecommendation,RecommendationFeedback
def record_feedback(*,recommendation,user,helpful=None,outcome="",comment=""):
    return RecommendationFeedback.objects.update_or_create(recommendation=recommendation,user=user,defaults={"helpful":helpful,"outcome":outcome,"comment":comment[:500]})[0]
def quality_summary(tenant=None):
    qs=NotificationRecommendation.objects.all()
    if tenant is not None: qs=qs.filter(tenant=tenant)
    return qs.aggregate(total=Count("id"),accepted=Count("id",filter=Q(status="accepted")),dismissed=Count("id",filter=Q(status="dismissed")),helpful=Count("feedback",filter=Q(feedback__helpful=True)),not_helpful=Count("feedback",filter=Q(feedback__helpful=False)))
