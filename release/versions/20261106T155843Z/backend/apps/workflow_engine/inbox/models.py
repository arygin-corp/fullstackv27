from django.conf import settings
from django.db import models
from ..models import TimeStampedModel,WorkflowInstance
from ..platform_models import Tenant
class WorkItem(TimeStampedModel):
 tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);instance=models.ForeignKey(WorkflowInstance,related_name='work_items',on_delete=models.CASCADE);kind=models.CharField(max_length=50);title=models.CharField(max_length=240);assigned_user=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.SET_NULL);assigned_group=models.CharField(max_length=150,blank=True);status=models.CharField(max_length=30,default='open');priority=models.CharField(max_length=20,default='normal');due_at=models.DateTimeField(null=True,blank=True);payload=models.JSONField(default=dict);snoozed_until=models.DateTimeField(null=True,blank=True)
class InboxPreference(TimeStampedModel):user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE);filters=models.JSONField(default=dict);sort=models.JSONField(default=list);digest=models.JSONField(default=dict)
