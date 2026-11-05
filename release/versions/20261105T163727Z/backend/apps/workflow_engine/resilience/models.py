from django.conf import settings
from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition,WorkflowInstance
from ..platform_models import Tenant
class ExecutionFreeze(TimeStampedModel):
 class Scope(models.TextChoices):GLOBAL='global','Global';TENANT='tenant','Tenant';WORKFLOW='workflow','Workflow';INSTANCE='instance','Instance'
 scope=models.CharField(max_length=20,choices=Scope.choices);tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);workflow=models.ForeignKey(WorkflowDefinition,null=True,blank=True,on_delete=models.CASCADE);instance=models.ForeignKey(WorkflowInstance,null=True,blank=True,on_delete=models.CASCADE);reason=models.TextField();active=models.BooleanField(default=True);created_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);released_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,related_name='+',on_delete=models.SET_NULL);released_at=models.DateTimeField(null=True,blank=True)
class RecoveryRun(TimeStampedModel):instance=models.ForeignKey(WorkflowInstance,related_name='recovery_runs',on_delete=models.CASCADE);strategy=models.CharField(max_length=80);status=models.CharField(max_length=30,default='pending');checkpoint=models.JSONField(default=dict);result=models.JSONField(default=dict);error=models.TextField(blank=True)
