from django.conf import settings
from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
class SimulationScenario(TimeStampedModel):workflow=models.ForeignKey(WorkflowDefinition,on_delete=models.CASCADE);name=models.CharField(max_length=160);arrival_model=models.JSONField(default=dict);service_times=models.JSONField(default=dict);routing_probabilities=models.JSONField(default=dict);staffing=models.JSONField(default=dict);cost_rates=models.JSONField(default=dict);iterations=models.PositiveIntegerField(default=1000);created_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
class SimulationRun(TimeStampedModel):scenario=models.ForeignKey(SimulationScenario,related_name='runs',on_delete=models.CASCADE);status=models.CharField(max_length=30,default='queued');seed=models.PositiveIntegerField(default=1);results=models.JSONField(default=dict);error=models.TextField(blank=True)
