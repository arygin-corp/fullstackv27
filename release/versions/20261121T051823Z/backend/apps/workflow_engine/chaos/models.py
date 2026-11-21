from django.db import models
from ..models import TimeStampedModel
class ChaosExperiment(TimeStampedModel):name=models.CharField(max_length=180);target_type=models.CharField(max_length=80);target_selector=models.JSONField(default=dict);fault=models.JSONField(default=dict);hypothesis=models.JSONField(default=dict);safety_limits=models.JSONField(default=dict);status=models.CharField(max_length=30,default='draft');enabled=models.BooleanField(default=False)
class ChaosRun(TimeStampedModel):experiment=models.ForeignKey(ChaosExperiment,related_name='runs',on_delete=models.PROTECT);status=models.CharField(max_length=30,default='queued');observations=models.JSONField(default=list);result=models.JSONField(default=dict);aborted=models.BooleanField(default=False);error=models.TextField(blank=True)
