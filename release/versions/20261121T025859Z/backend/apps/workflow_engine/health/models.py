from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
class WorkflowHealthSnapshot(TimeStampedModel):workflow=models.ForeignKey(WorkflowDefinition,related_name='health_snapshots',on_delete=models.CASCADE);score=models.DecimalField(max_digits=5,decimal_places=2);status=models.CharField(max_length=30);signals=models.JSONField(default=dict);window=models.CharField(max_length=40,default='current');recommendations=models.JSONField(default=list)
