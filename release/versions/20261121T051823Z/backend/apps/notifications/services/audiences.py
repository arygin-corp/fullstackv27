import hashlib
import json
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from notifications.models import AudienceOperator, AudienceSnapshot, AudienceSnapshotMember
from notifications.services.tenancy import scope_queryset
ALLOWED_FIELDS={"is_staff","is_active","groups__name","username","email","notification_preference__in_app_enabled","notification_preference__email_enabled","notification_preference__teams_enabled","notification_preference__mobile_push_enabled","notification_tenant_memberships__role","notification_tenant_memberships__tenant_id"}
PROTECTED_OR_DISALLOWED={"age","gender","sex","race","religion","disability","sexual_orientation","ethnicity"}

def validate_condition(condition):
    field=condition.field.lower()
    if field in PROTECTED_OR_DISALLOWED or any(x in field for x in PROTECTED_OR_DISALLOWED): raise ValidationError("Protected characteristics cannot be used for audience targeting.")
    if condition.field not in ALLOWED_FIELDS: raise ValidationError(f"Audience field is not allowlisted: {condition.field}")
    if condition.operator not in AudienceOperator.values: raise ValidationError("Unsupported audience operator")

def evaluate_audience(audience,limit=None):
    if not settings.DYNAMIC_AUDIENCES_ENABLED: raise RuntimeError("Dynamic audiences are disabled")
    User=get_user_model(); qs=User.objects.filter(is_active=True)
    if settings.MULTI_TENANCY_ENABLED:
        qs=qs.filter(notification_tenant_memberships__tenant=audience.tenant,notification_tenant_memberships__is_active=True)
    for condition in audience.conditions.all():
        validate_condition(condition); field=condition.field; value=condition.value
        if condition.operator==AudienceOperator.EQUALS: qs=qs.filter(**{field:value})
        elif condition.operator==AudienceOperator.IN: qs=qs.filter(**{f"{field}__in":value})
        elif condition.operator==AudienceOperator.CONTAINS: qs=qs.filter(**{f"{field}__icontains":value})
        elif condition.operator==AudienceOperator.IS_TRUE: qs=qs.filter(**{field:True})
        elif condition.operator==AudienceOperator.IS_FALSE: qs=qs.filter(**{field:False})
    if audience.include_user_ids: qs=qs | User.objects.filter(pk__in=audience.include_user_ids,is_active=True)
    if audience.exclude_user_ids: qs=qs.exclude(pk__in=audience.exclude_user_ids)
    qs=qs.distinct().order_by("pk")
    return qs[:limit or settings.DYNAMIC_AUDIENCE_MAX_MEMBERS]

def definition(audience):
    return {"audience_id":audience.pk,"tenant_id":audience.tenant_id,"application_id":audience.application_id,"conditions":[{"field":c.field,"operator":c.operator,"value":c.value} for c in audience.conditions.order_by("id")],"include_user_ids":audience.include_user_ids,"exclude_user_ids":audience.exclude_user_ids}

def create_snapshot(audience,campaign=None,actor=None):
    members=list(evaluate_audience(audience)); data=definition(audience); digest=hashlib.sha256(json.dumps(data,sort_keys=True,default=str).encode()).hexdigest()
    snapshot=AudienceSnapshot.objects.create(audience=audience,campaign=campaign,definition=data,member_count=len(members),definition_hash=digest,created_by=actor)
    AudienceSnapshotMember.objects.bulk_create([AudienceSnapshotMember(snapshot=snapshot,user=u) for u in members],ignore_conflicts=True)
    return snapshot
