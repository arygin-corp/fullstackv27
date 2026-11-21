from django.conf import settings
from django.contrib.auth.models import Group
from django.db import models
from django.db.models import Q
from .models import TimeStampedModel,WorkflowDefinition,WorkflowInstance,WorkflowState
from .platform_models import Tenant
class DedicatedStaffAssignment(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,related_name='staff_assignments',on_delete=models.CASCADE)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,related_name='dedicated_workflow_staffing',on_delete=models.CASCADE)
    group=models.ForeignKey(Group,related_name='dedicated_workflow_staffing',on_delete=models.PROTECT)
    workflow=models.ForeignKey(WorkflowDefinition,related_name='dedicated_staff',null=True,blank=True,on_delete=models.CASCADE)
    instance=models.ForeignKey(WorkflowInstance,related_name='dedicated_staff',null=True,blank=True,on_delete=models.CASCADE)
    state=models.ForeignKey(WorkflowState,related_name='dedicated_staff',null=True,blank=True,on_delete=models.CASCADE)
    role=models.CharField(max_length=80,default='operator'); active=models.BooleanField(default=True); starts_at=models.DateTimeField(); ends_at=models.DateTimeField(null=True,blank=True)
    class Meta:
        constraints=[models.CheckConstraint(check=Q(workflow__isnull=False)|Q(instance__isnull=False)|Q(state__isnull=False),name='staff_assignment_has_scope')]
        indexes=[models.Index(fields=('tenant','user','active')),models.Index(fields=('instance','role','active'))]
class WorkflowAccessPolicy(TimeStampedModel):
    class Action(models.TextChoices): VIEW='view','View'; TRANSITION='transition','Transition'; APPROVE='approve','Approve'; COMMENT='comment','Comment'; ATTACH='attach','Attach'; ROLLBACK='rollback','Rollback'; PUBLISH='publish','Publish'; ADMIN='admin','Admin'
    tenant=models.ForeignKey(Tenant,related_name='workflow_access_policies',on_delete=models.CASCADE)
    workflow=models.ForeignKey(WorkflowDefinition,related_name='access_policies',null=True,blank=True,on_delete=models.CASCADE)
    action=models.CharField(max_length=30,choices=Action.choices); groups=models.ManyToManyField(Group,related_name='workflow_access_policies')
    requires_dedicated_staff=models.BooleanField(default=True); role=models.CharField(max_length=80,blank=True); active=models.BooleanField(default=True)
    class Meta: constraints=[models.UniqueConstraint(fields=('tenant','workflow','action','role'),name='uq_workflow_access_policy')]
class IdempotencyRecord(models.Model):
    tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE); key=models.CharField(max_length=160); operation=models.CharField(max_length=100); request_hash=models.CharField(max_length=64); response=models.JSONField(default=dict); resource_type=models.CharField(max_length=80,blank=True); resource_id=models.CharField(max_length=100,blank=True); created_at=models.DateTimeField(auto_now_add=True); expires_at=models.DateTimeField()
    class Meta: constraints=[models.UniqueConstraint(fields=('tenant','key','operation'),name='uq_idempotency_operation')]
class DurableJob(TimeStampedModel):
    class Status(models.TextChoices): PENDING='pending','Pending'; RUNNING='running','Running'; RETRY='retry','Retry'; SUCCEEDED='succeeded','Succeeded'; DEAD='dead','Dead'
    tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE); kind=models.CharField(max_length=100,db_index=True); payload=models.JSONField(default=dict); idempotency_key=models.CharField(max_length=160,unique=True); status=models.CharField(max_length=20,choices=Status.choices,default=Status.PENDING,db_index=True); available_at=models.DateTimeField(db_index=True); locked_by=models.CharField(max_length=120,blank=True); locked_until=models.DateTimeField(null=True,blank=True); attempts=models.PositiveIntegerField(default=0); max_attempts=models.PositiveIntegerField(default=8); last_error=models.TextField(blank=True)
class DeadLetter(models.Model):
    job=models.OneToOneField(DurableJob,related_name='dead_letter',on_delete=models.CASCADE); failed_at=models.DateTimeField(auto_now_add=True); reason=models.TextField(); payload=models.JSONField(default=dict)
