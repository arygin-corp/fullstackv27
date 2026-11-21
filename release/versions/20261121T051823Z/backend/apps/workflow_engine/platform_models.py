from django.conf import settings
from django.db import models
from .models import (TimeStampedModel, WorkflowDefinition, WorkflowInstance, WorkflowState,)
def default_working_days():
    return [0, 1, 2, 3, 4]




class Tenant(TimeStampedModel):
    name = models.CharField(max_length=150)
    key = models.SlugField(unique=True)
    active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)


class TenantMembership(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, related_name="memberships", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="workflow_tenants", on_delete=models.CASCADE,)
    role = models.CharField(max_length=80, default="member")
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("tenant", "user"), name="uq_tenant_member")
        ]


class BusinessCalendar(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    timezone = models.CharField(max_length=64, default="UTC")
    working_days=models.JSONField(default=default_working_days)
    workday_start = models.TimeField()
    workday_end = models.TimeField()


class CalendarHoliday(models.Model):
    calendar = models.ForeignKey(BusinessCalendar, related_name="holidays", on_delete=models.CASCADE)
    date = models.DateField()
    name = models.CharField(max_length=150)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("calendar", "date"), name="uq_calendar_holiday"
            )
        ]


class BusinessRule(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    key = models.SlugField()
    version = models.PositiveIntegerField(default=1)
    expression = models.JSONField(default=dict)
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("tenant", "key", "version"), name="uq_business_rule_version"
            )
        ]


class Policy(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, related_name="policies", on_delete=models.CASCADE)
    name = models.CharField(max_length=180)
    key = models.SlugField()
    version = models.CharField(max_length=40)
    status = models.CharField(max_length=30, default="draft")
    description = models.TextField(blank=True)
    effective_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)


class Control(TimeStampedModel):
    policy = models.ForeignKey(Policy, related_name="controls", on_delete=models.CASCADE)
    name = models.CharField(max_length=180)
    key = models.SlugField()
    owner_role = models.CharField(max_length=80)
    frequency = models.CharField(max_length=40, blank=True)
    evidence_requirements = models.JSONField(default=list, blank=True)


class ControlExecution(TimeStampedModel):
    control = models.ForeignKey(Control, related_name="executions", on_delete=models.PROTECT)
    instance = models.ForeignKey(WorkflowInstance, related_name="control_executions", null=True, blank=True, on_delete=models.SET_NULL,)
    status = models.CharField(max_length=30)
    evidence = models.JSONField(default=dict)
    executed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)


class PolicyException(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.PROTECT)
    instance = models.OneToOneField(WorkflowInstance, null=True, blank=True, on_delete=models.SET_NULL)
    justification = models.TextField()
    status = models.CharField(max_length=30, default="requested")
    risk_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    expires_at = models.DateTimeField(null=True, blank=True)


class DataClassification(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    key = models.SlugField()
    rank = models.PositiveSmallIntegerField(default=0)
    handling_rules = models.JSONField(default=dict)


class RiskAssessment(TimeStampedModel):
    instance = models.ForeignKey(WorkflowInstance, related_name="risk_assessments", on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=6, decimal_places=2)
    level = models.CharField(max_length=30)
    factors = models.JSONField(default=dict)
    model_version = models.CharField(max_length=100, blank=True)
    assessed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class DeploymentPackage(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.CASCADE)
    workflow = models.ForeignKey(WorkflowDefinition, on_delete=models.PROTECT)
    environment = models.CharField(max_length=30)
    package = models.JSONField(default=dict)
    checksum = models.CharField(max_length=64)
    status = models.CharField(max_length=30, default="created")
    deployed_at = models.DateTimeField(null=True, blank=True)
    deployed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)


class ProcessEvent(models.Model):
    tenant_key = models.CharField(max_length=100, blank=True, db_index=True)
    stream_id = models.CharField(max_length=150, db_index=True)
    sequence = models.PositiveIntegerField()
    event_type = models.CharField(max_length=120, db_index=True)
    data = models.JSONField(default=dict)
    metadata = models.JSONField(default=dict)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("stream_id", "sequence"), name="uq_stream_sequence"
            )
        ]
        ordering = ("stream_id", "sequence")


class ProcessSnapshot(models.Model):
    stream_id = models.CharField(max_length=150, db_index=True)
    sequence = models.PositiveIntegerField()
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class SagaInstance(TimeStampedModel):
    instance = models.ForeignKey(WorkflowInstance, related_name="sagas", on_delete=models.CASCADE)
    key = models.SlugField()
    status = models.CharField(max_length=30, default="running")
    context = models.JSONField(default=dict)


class SagaStep(TimeStampedModel):
    saga = models.ForeignKey(SagaInstance, related_name="steps", on_delete=models.CASCADE)
    position = models.PositiveIntegerField()
    action_key = models.CharField(max_length=150)
    compensation_key = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=30, default="pending")
    result = models.JSONField(default=dict)
    error = models.TextField(blank=True)

    class Meta:
        ordering = ("position",)
        constraints = [
            models.UniqueConstraint(
                fields=("saga", "position"), name="uq_saga_position"
            )
        ]


class SearchDocument(TimeStampedModel):
    tenant_key = models.CharField(max_length=100, db_index=True)
    object_type = models.CharField(max_length=80)
    object_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    attributes = models.JSONField(default=dict)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("tenant_key", "object_type", "object_id"),
                name="uq_search_document",
            )
        ]


class AIInteraction(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    purpose = models.CharField(max_length=80)
    provider = models.CharField(max_length=80)
    model = models.CharField(max_length=120)
    prompt_hash = models.CharField(max_length=64)
    response = models.JSONField(default=dict)
    approved = models.BooleanField(default=False)
    safety_metadata = models.JSONField(default=dict)
