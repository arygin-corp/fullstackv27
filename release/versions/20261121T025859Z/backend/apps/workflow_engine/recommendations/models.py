from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
class OptimizationRecommendation(TimeStampedModel):workflow=models.ForeignKey(WorkflowDefinition,related_name='recommendations',on_delete=models.CASCADE);kind=models.CharField(max_length=80);title=models.CharField(max_length=220);evidence=models.JSONField(default=dict);proposal=models.JSONField(default=dict);confidence=models.DecimalField(max_digits=5,decimal_places=4,null=True);status=models.CharField(max_length=30,default='proposed');review_notes=models.TextField(blank=True)
