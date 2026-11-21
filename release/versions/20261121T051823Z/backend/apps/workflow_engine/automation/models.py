from django.conf import settings as django_settings
from django.db import models
from ..models import TimeStampedModel, WorkflowDefinition, WorkflowInstance
from ..platform_models import Tenant


class AutomationFlow(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=180)
    key = models.SlugField()
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=30, default="draft")
    definition = models.JSONField(default=dict)
    settings = models.JSONField(default=dict)
    workflow = models.ForeignKey(WorkflowDefinition, null=True, blank=True, on_delete=models.SET_NULL)
    created_by = models.ForeignKey(django_settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("tenant", "key", "version"), name="uq_automation_flow_version"
            )
        ]


class AutomationNode(TimeStampedModel):
    flow = models.ForeignKey(AutomationFlow, related_name="nodes", on_delete=models.CASCADE)
    node_id = models.CharField(max_length=100)
    kind = models.CharField(max_length=40)
    provider = models.CharField(max_length=100, blank=True)
    operation = models.CharField(max_length=120, blank=True)
    configuration = models.JSONField(default=dict)
    input_mapping = models.JSONField(default=dict)
    position = models.JSONField(default=dict)
    retry_policy = models.JSONField(default=dict)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("flow", "node_id"), name="uq_automation_node"
            )
        ]


class AutomationEdge(models.Model):
    flow = models.ForeignKey(AutomationFlow, related_name="edges", on_delete=models.CASCADE)
    source = models.CharField(max_length=100)
    target = models.CharField(max_length=100)
    condition = models.JSONField(default=dict)
    label = models.CharField(max_length=120, blank=True)
    position = models.PositiveIntegerField(default=0)


class FlowExecution(TimeStampedModel):
    flow = models.ForeignKey(AutomationFlow, related_name="executions", on_delete=models.PROTECT)
    instance = models.ForeignKey(WorkflowInstance, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=30, default="queued", db_index=True)
    trigger_payload = models.JSONField(default=dict)
    context = models.JSONField(default=dict)
    current_nodes = models.JSONField(default=list)
    idempotency_key = models.CharField(max_length=160, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)


class NodeExecution(TimeStampedModel):
    execution = models.ForeignKey(FlowExecution, related_name="node_executions", on_delete=models.CASCADE)
    node_id = models.CharField(max_length=100)
    attempt = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=30)
    input = models.JSONField(default=dict)
    output = models.JSONField(default=dict)
    started_at = models.DateTimeField(null=True)
    completed_at = models.DateTimeField(null=True)
    error = models.TextField(blank=True)


class FlowSchedule(TimeStampedModel):
    flow = models.ForeignKey(AutomationFlow, related_name="schedules", on_delete=models.CASCADE)
    cron = models.CharField(max_length=100)
    timezone = models.CharField(max_length=64, default="UTC")
    enabled = models.BooleanField(default=True)
    next_run_at = models.DateTimeField(null=True, blank=True)


class WebhookTrigger(TimeStampedModel):
    flow = models.ForeignKey(AutomationFlow, related_name="webhook_triggers", on_delete=models.CASCADE)
    key = models.CharField(max_length=160, unique=True)
    secret_hash = models.CharField(max_length=128)
    enabled = models.BooleanField(default=True)
    schema = models.JSONField(default=dict)
    rate_limit = models.PositiveIntegerField(default=60)


class ReusableSubflow(TimeStampedModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=180)
    key = models.SlugField()
    version = models.PositiveIntegerField(default=1)
    definition = models.JSONField(default=dict)
    input_schema = models.JSONField(default=dict)
    output_schema = models.JSONField(default=dict)


class ExecutionQuota(TimeStampedModel):
    tenant = models.OneToOneField(Tenant, related_name="execution_quota", on_delete=models.CASCADE)
    executions_per_minute = models.PositiveIntegerField(default=100)
    concurrent_executions = models.PositiveIntegerField(default=20)
    monthly_operations = models.PositiveBigIntegerField(default=100000)
    used_operations = models.PositiveBigIntegerField(default=0)
