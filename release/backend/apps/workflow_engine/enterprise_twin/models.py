from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class EnterpriseScenario(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);assumptions=models.JSONField(default=dict);policy_changes=models.JSONField(default=list);staffing_changes=models.JSONField(default=list);budget_changes=models.JSONField(default=list);status=models.CharField(max_length=30,default='draft')
class EnterpriseSimulationRun(TimeStampedModel):scenario=models.ForeignKey(EnterpriseScenario,related_name='runs',on_delete=models.CASCADE);seed=models.PositiveIntegerField(default=1);iterations=models.PositiveIntegerField(default=1000);status=models.CharField(max_length=30,default='queued');results=models.JSONField(default=dict);error=models.TextField(blank=True)
