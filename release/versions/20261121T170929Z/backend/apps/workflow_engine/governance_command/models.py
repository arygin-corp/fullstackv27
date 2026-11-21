from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class GovernanceView(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();widgets=models.JSONField(default=list);filters=models.JSONField(default=dict);audience_roles=models.JSONField(default=list)
class GovernanceSignal(models.Model):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);signal_type=models.CharField(max_length=80,db_index=True);severity=models.CharField(max_length=30);title=models.CharField(max_length=240);details=models.JSONField(default=dict);source_type=models.CharField(max_length=80);source_id=models.CharField(max_length=120);status=models.CharField(max_length=30,default='open');created_at=models.DateTimeField(auto_now_add=True)
class GovernanceBrief(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);period=models.CharField(max_length=80);summary=models.JSONField(default=dict);generated_by=models.CharField(max_length=80,default='system');review_status=models.CharField(max_length=30,default='pending')
