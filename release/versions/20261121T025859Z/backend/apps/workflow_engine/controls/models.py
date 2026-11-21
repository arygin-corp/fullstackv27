from django.db import models
from ..models import TimeStampedModel,WorkflowInstance
from ..platform_models import Control
class AutomatedControl(TimeStampedModel):control=models.OneToOneField(Control,related_name='automation',on_delete=models.CASCADE);executor_key=models.CharField(max_length=160);input_mapping=models.JSONField(default=dict);schedule=models.JSONField(default=dict);enabled=models.BooleanField(default=False);failure_action=models.CharField(max_length=60,default='flag')
class ControlRun(TimeStampedModel):automation=models.ForeignKey(AutomatedControl,related_name='runs',on_delete=models.PROTECT);instance=models.ForeignKey(WorkflowInstance,null=True,blank=True,on_delete=models.SET_NULL);status=models.CharField(max_length=30,default='queued');input=models.JSONField(default=dict);output=models.JSONField(default=dict);evidence=models.JSONField(default=dict);error=models.TextField(blank=True)
