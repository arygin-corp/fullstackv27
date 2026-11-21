from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

class TimeStampedModel(models.Model):
    created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: abstract=True

class WorkflowDefinition(TimeStampedModel):
    class Lifecycle(models.TextChoices):
        DRAFT='draft','Draft'; PUBLISHED='published','Published'; RETIRED='retired','Retired'
    tenant=models.ForeignKey('workflow_engine.Tenant',related_name='workflow_definitions',null=True,blank=True,on_delete=models.CASCADE)
    name=models.CharField(max_length=150); key=models.SlugField(max_length=100); version=models.PositiveIntegerField(default=1)
    description=models.TextField(blank=True); lifecycle=models.CharField(max_length=20,choices=Lifecycle.choices,default=Lifecycle.DRAFT)
    settings=models.JSONField(default=dict,blank=True); published_at=models.DateTimeField(null=True,blank=True)
    class Meta:
        ordering=('key','-version'); constraints=[models.UniqueConstraint(fields=('key','version'),name='uq_workflow_version')]
    @property
    def is_active(self): return self.lifecycle==self.Lifecycle.PUBLISHED
    def __str__(self): return f'{self.name} v{self.version}'

class WorkflowState(TimeStampedModel):
    class JoinMode(models.TextChoices): ALL='all','All'; ANY='any','Any'; MAJORITY='majority','Majority'
    tenant=models.ForeignKey('workflow_engine.Tenant',related_name='workflow_states',null=True,blank=True,on_delete=models.CASCADE)
    workflow=models.ForeignKey(WorkflowDefinition,related_name='states',on_delete=models.CASCADE)
    name=models.CharField(max_length=100); key=models.SlugField(max_length=100); description=models.TextField(blank=True)
    is_initial=models.BooleanField(default=False); is_terminal=models.BooleanField(default=False)
    is_parallel=models.BooleanField(default=False); join_mode=models.CharField(max_length=20,choices=JoinMode.choices,default=JoinMode.ALL)
    sla_hours=models.PositiveIntegerField(null=True,blank=True); warning_hours=models.PositiveIntegerField(null=True,blank=True)
    metadata=models.JSONField(default=dict,blank=True)
    class Meta:
        ordering=('workflow','key'); constraints=[
            models.UniqueConstraint(fields=('workflow','key'),name='uq_state_key'),
            models.UniqueConstraint(fields=('workflow',),condition=Q(is_initial=True),name='uq_initial_state')]
    def clean(self):
        if self.is_initial and self.is_terminal: raise ValidationError('A state cannot be both initial and terminal.')
    def __str__(self): return f'{self.workflow.key}:{self.key}'

class WorkflowTransition(TimeStampedModel):
    workflow=models.ForeignKey(WorkflowDefinition,related_name='transitions',on_delete=models.CASCADE)
    name=models.CharField(max_length=100); key=models.SlugField(max_length=100)
    source=models.ForeignKey(WorkflowState,related_name='outgoing_transitions',on_delete=models.CASCADE)
    target=models.ForeignKey(WorkflowState,related_name='incoming_transitions',on_delete=models.CASCADE)
    condition=models.JSONField(default=dict,blank=True,help_text='Safe declarative condition tree.')
    guard_path=models.CharField(max_length=255,blank=True); required_permission=models.CharField(max_length=255,blank=True)
    required_role=models.CharField(max_length=80,blank=True); priority=models.IntegerField(default=0); is_active=models.BooleanField(default=True)
    action_key=models.SlugField(max_length=100,blank=True); metadata=models.JSONField(default=dict,blank=True)
    class Meta:
        ordering=('workflow','source','-priority','key'); constraints=[models.UniqueConstraint(fields=('workflow','key'),name='uq_transition_key')]
    def clean(self):
        if self.source_id and self.source.workflow_id!=self.workflow_id: raise ValidationError({'source':'State belongs to another workflow.'})
        if self.target_id and self.target.workflow_id!=self.workflow_id: raise ValidationError({'target':'State belongs to another workflow.'})
    def __str__(self): return f'{self.source.key} -> {self.target.key} ({self.key})'

class WorkflowInstance(TimeStampedModel):
    class Status(models.TextChoices): RUNNING='running','Running'; COMPLETED='completed','Completed'; CANCELLED='cancelled','Cancelled'; SUSPENDED='suspended','Suspended'; FAILED='failed','Failed'
    tenant=models.ForeignKey('workflow_engine.Tenant',related_name='workflow_instances',null=True,blank=True,on_delete=models.PROTECT)
    workflow=models.ForeignKey(WorkflowDefinition,related_name='instances',on_delete=models.PROTECT)
    current_state=models.ForeignKey(WorkflowState,related_name='instances',on_delete=models.PROTECT)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.RUNNING); context=models.JSONField(default=dict,blank=True)
    external_id=models.CharField(max_length=255,blank=True,db_index=True); correlation_id=models.CharField(max_length=255,blank=True,db_index=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='created_workflows',null=True,blank=True,on_delete=models.SET_NULL)
    due_at=models.DateTimeField(null=True,blank=True); completed_at=models.DateTimeField(null=True,blank=True); revision=models.PositiveIntegerField(default=0)
    class Meta: ordering=('-created_at',); indexes=[models.Index(fields=('workflow','status')),models.Index(fields=('due_at','status'))]
    def clean(self):
        if self.current_state_id and self.current_state.workflow_id!=self.workflow_id: raise ValidationError('Current state belongs to another workflow.')
    def __str__(self): return f'#{self.pk} {self.workflow.key}:{self.current_state.key}'

class WorkflowRole(TimeStampedModel):
    workflow=models.ForeignKey(WorkflowDefinition,related_name='roles',on_delete=models.CASCADE); key=models.SlugField(max_length=80); name=models.CharField(max_length=100)
    class Meta: constraints=[models.UniqueConstraint(fields=('workflow','key'),name='uq_workflow_role')]

class WorkflowAssignment(TimeStampedModel):
    instance=models.ForeignKey(WorkflowInstance,related_name='assignments',on_delete=models.CASCADE); role=models.CharField(max_length=80)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='workflow_assignments',on_delete=models.CASCADE); active=models.BooleanField(default=True)
    class Meta: constraints=[models.UniqueConstraint(fields=('instance','role','user'),name='uq_instance_role_user')]

class Delegation(TimeStampedModel):
    principal=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='delegations_given',on_delete=models.CASCADE)
    delegate=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='delegations_received',on_delete=models.CASCADE)
    starts_at=models.DateTimeField(); ends_at=models.DateTimeField(); workflow_key=models.SlugField(max_length=100,blank=True); active=models.BooleanField(default=True)
    def clean(self):
        if self.principal_id==self.delegate_id: raise ValidationError('A user cannot delegate to themselves.')
        if self.ends_at<=self.starts_at: raise ValidationError('ends_at must be after starts_at.')

class ApprovalTask(TimeStampedModel):
    class Status(models.TextChoices): PENDING='pending','Pending'; APPROVED='approved','Approved'; REJECTED='rejected','Rejected'; CANCELLED='cancelled','Cancelled'
    instance=models.ForeignKey(WorkflowInstance,related_name='approval_tasks',on_delete=models.CASCADE)
    state=models.ForeignKey(WorkflowState,related_name='approval_tasks',on_delete=models.PROTECT)
    assigned_to=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='approval_tasks',null=True,blank=True,on_delete=models.SET_NULL)
    role=models.CharField(max_length=80,blank=True); status=models.CharField(max_length=20,choices=Status.choices,default=Status.PENDING)
    decision_comment=models.TextField(blank=True); due_at=models.DateTimeField(null=True,blank=True); decided_at=models.DateTimeField(null=True,blank=True)

class TransitionEvent(models.Model):
    instance=models.ForeignKey(WorkflowInstance,related_name='events',on_delete=models.CASCADE)
    transition=models.ForeignKey(WorkflowTransition,related_name='events',null=True,blank=True,on_delete=models.PROTECT)
    source_state=models.ForeignKey(WorkflowState,related_name='departing_events',on_delete=models.PROTECT)
    target_state=models.ForeignKey(WorkflowState,related_name='arriving_events',on_delete=models.PROTECT)
    actor=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='workflow_events',null=True,blank=True,on_delete=models.SET_NULL)
    event_type=models.CharField(max_length=50,default='transition'); payload=models.JSONField(default=dict,blank=True); context_before=models.JSONField(default=dict,blank=True); context_after=models.JSONField(default=dict,blank=True)
    ip_address=models.GenericIPAddressField(null=True,blank=True); user_agent=models.CharField(max_length=512,blank=True); occurred_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=('occurred_at','pk'); indexes=[models.Index(fields=('instance','occurred_at'))]

class WorkflowComment(TimeStampedModel):
    instance=models.ForeignKey(WorkflowInstance,related_name='comments',on_delete=models.CASCADE); author=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
    body=models.TextField(); is_internal=models.BooleanField(default=False)

class WorkflowAttachment(TimeStampedModel):
    instance=models.ForeignKey(WorkflowInstance,related_name='attachments',on_delete=models.CASCADE); uploaded_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
    file=models.FileField(upload_to='workflow/%Y/%m/'); original_name=models.CharField(max_length=255); content_type=models.CharField(max_length=120,blank=True); size=models.PositiveBigIntegerField(default=0); sha256=models.CharField(max_length=64,blank=True)

class ElectronicSignature(models.Model):
    instance=models.ForeignKey(WorkflowInstance,related_name='signatures',on_delete=models.CASCADE); event=models.OneToOneField(TransitionEvent,related_name='signature',on_delete=models.CASCADE)
    signed_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT); meaning=models.CharField(max_length=255); signature_hash=models.CharField(max_length=64); signed_at=models.DateTimeField(auto_now_add=True)

class SLARule(TimeStampedModel):
    workflow=models.ForeignKey(WorkflowDefinition,related_name='sla_rules',on_delete=models.CASCADE); state=models.ForeignKey(WorkflowState,related_name='sla_rules',on_delete=models.CASCADE)
    due_after_hours=models.PositiveIntegerField(); warn_before_hours=models.PositiveIntegerField(default=24); escalate_after_hours=models.PositiveIntegerField(default=0); escalate_to_role=models.CharField(max_length=80,blank=True); auto_transition_key=models.SlugField(max_length=100,blank=True)

class Notification(TimeStampedModel):
    class Status(models.TextChoices): PENDING='pending','Pending'; SENT='sent','Sent'; FAILED='failed','Failed'
    instance=models.ForeignKey(WorkflowInstance,related_name='notifications',on_delete=models.CASCADE); channel=models.CharField(max_length=30); recipient=models.CharField(max_length=255)
    template_key=models.CharField(max_length=120); payload=models.JSONField(default=dict,blank=True); status=models.CharField(max_length=20,choices=Status.choices,default=Status.PENDING); attempts=models.PositiveIntegerField(default=0); last_error=models.TextField(blank=True); sent_at=models.DateTimeField(null=True,blank=True)

class WebhookSubscription(TimeStampedModel):
    workflow=models.ForeignKey(WorkflowDefinition,related_name='webhooks',null=True,blank=True,on_delete=models.CASCADE); url=models.URLField(); secret=models.CharField(max_length=255); events=models.JSONField(default=list); active=models.BooleanField(default=True)

class OutboxEvent(models.Model):
    topic=models.CharField(max_length=150,db_index=True); aggregate_id=models.CharField(max_length=100); payload=models.JSONField(default=dict); created_at=models.DateTimeField(auto_now_add=True); published_at=models.DateTimeField(null=True,blank=True); attempts=models.PositiveIntegerField(default=0); last_error=models.TextField(blank=True)

class EscalationEvent(models.Model):
    instance=models.ForeignKey(WorkflowInstance,related_name='escalations',on_delete=models.CASCADE); rule=models.ForeignKey(SLARule,null=True,on_delete=models.SET_NULL); escalated_to_role=models.CharField(max_length=80); occurred_at=models.DateTimeField(auto_now_add=True); details=models.JSONField(default=dict)

class WorkflowTemplate(TimeStampedModel):
    name=models.CharField(max_length=150); key=models.SlugField(unique=True); description=models.TextField(blank=True); definition=models.JSONField(default=dict); active=models.BooleanField(default=True)


# Platform extension models
from .platform_models import *  # noqa: E402,F401,F403

from .security_models import *  # noqa: E402,F401,F403

# Master V2 domain models
from .forms.models import *  # noqa
from .marketplace.models import *  # noqa
from .plugins.models import *  # noqa
from .identity.models import *  # noqa
from .knowledge_graph.models import *  # noqa
from .agents.models import *  # noqa
from .digital_twin.models import *  # noqa
from .costing.models import *  # noqa
from .warehouse.models import *  # noqa
from .recommendations.models import *  # noqa
from .builder.models import *  # noqa

# Master V3 models
from .migrations_engine.models import *  # noqa
from .resilience.models import *  # noqa
from .records.models import *  # noqa
from .dependencies.models import *  # noqa
from .portal.models import *  # noqa
from .inbox.models import *  # noqa
from .controls.models import *  # noqa
from .regulatory.models import *  # noqa
from .replay.models import *  # noqa
from .genome.models import *  # noqa
from .health.models import *  # noqa

# Master V4 models
from .automation.models import *  # noqa
from .connector_marketplace.models import *  # noqa
from .observability_v2.models import *  # noqa
from .operations.models import *  # noqa
from .performance.models import *  # noqa

# Master V5 models
from .agent_marketplace.models import *  # noqa
from .multi_agent.models import *  # noqa
from .knowledge_fabric.models import *  # noqa
from .process_discovery.models import *  # noqa
from .collaboration.models import *  # noqa
from .citizen_studio.models import *  # noqa
from .business_architecture.models import *  # noqa
from .change_management.models import *  # noqa
from .commerce.models import *  # noqa
from .enterprise_search.models import *  # noqa
from .data_lake.models import *  # noqa
from .decision_intelligence.models import *  # noqa
from .enterprise_twin.models import *  # noqa
from .workflow_gps.models import *  # noqa
from .autonomous_optimization.models import *  # noqa
from .governance_command.models import *  # noqa

# Master V6 models
from .certification.models import *  # noqa
from .durable_runtime.models import *  # noqa
from .streaming.models import *  # noqa
from .sre.models import *  # noqa
from .aiops.models import *  # noqa
from .developer_portal.models import *  # noqa
from .gitops.models import *  # noqa
from .vikki_memory.models import *  # noqa
from .ai_safety.models import *  # noqa
from .chaos.models import *  # noqa
from .self_healing.models import *  # noqa
from .multi_region.models import *  # noqa
from .adaptive_ux.models import *  # noqa
