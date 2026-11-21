from django.conf import settings
from apps.notifications.models import NotificationPriorityAssessment, NotificationType, PriorityLevel, PriorityPolicy
from apps.notifications.monitoring.metrics import inc
from apps.notifications.services.eventsourcing import append_event

ORDER={PriorityLevel.LOW:1,PriorityLevel.MEDIUM:2,PriorityLevel.HIGH:3,PriorityLevel.CRITICAL:4}

def deterministic_assessment(notification):
    score=50; reasons=[]; required=None
    if notification.notification_type==NotificationType.SECURITY:
        score=100; required=PriorityLevel.CRITICAL; reasons.append("mandatory_security")
    elif notification.notification_type in {NotificationType.APPROVAL,NotificationType.GOVERNANCE}:
        score+=20; reasons.append("action_or_governance")
    if notification.source in {"incident","security"}:
        score=max(score,90); reasons.append("critical_source")
    for policy in PriorityPolicy.objects.filter(is_active=True):
        if policy.notification_type and policy.notification_type!=notification.notification_type: continue
        if policy.source and policy.source!=notification.source: continue
        score=max(score,policy.base_score); reasons.append(f"policy:{policy.name}")
        if policy.required_priority: required=policy.required_priority
    if score>=90: recommended=PriorityLevel.CRITICAL
    elif score>=70: recommended=PriorityLevel.HIGH
    elif score>=40: recommended=PriorityLevel.MEDIUM
    else: recommended=PriorityLevel.LOW
    final=recommended
    if required and ORDER[required]>ORDER[final]: final=required; reasons.append("policy_floor")
    return {"recommended_priority":recommended,"final_priority":final,"confidence":1.0,"score":min(score,100),"reason_codes":reasons or ["default_policy"],"provider":"deterministic","model_name":"rules-v1"}

def assess_priority(notification):
    if not settings.AI_PRIORITIZATION_ENABLED:
        data=deterministic_assessment(notification); data["reason_codes"].append("ai_disabled")
    else:
        data=deterministic_assessment(notification)
    assessment,_=NotificationPriorityAssessment.objects.update_or_create(notification=notification,defaults=data)
    append_event(aggregate_type="Notification",aggregate_id=notification.pk,event_type="notification.priority.assessed",correlation_id=notification.correlation_id,tenant=notification.tenant,application=notification.application,payload={"final_priority":assessment.final_priority,"score":assessment.score,"reason_codes":assessment.reason_codes,"provider":assessment.provider})
    inc("notification_priority_assessments_total",labels={"priority":assessment.final_priority,"provider":assessment.provider})
    return assessment

def override_priority(notification,priority,actor,reason):
    assessment=notification.priority_assessment
    mandatory=deterministic_assessment(notification)["final_priority"]
    if ORDER[priority]<ORDER[mandatory] and mandatory==PriorityLevel.CRITICAL:
        raise ValueError("Mandatory critical priority cannot be reduced")
    assessment.final_priority=priority; assessment.overridden_by=actor; assessment.override_reason=reason[:500]; assessment.save()
    append_event(aggregate_type="Notification",aggregate_id=notification.pk,event_type="notification.priority.overridden",correlation_id=notification.correlation_id,actor=actor,tenant=notification.tenant,application=notification.application,payload={"final_priority":priority,"reason":reason[:200]})
    return assessment
