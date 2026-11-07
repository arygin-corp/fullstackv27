from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class AISafetyPolicy(TimeStampedModel):tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);name=models.CharField(max_length=180);risk_level=models.CharField(max_length=30);rules=models.JSONField(default=list);enabled=models.BooleanField(default=True);block_on_failure=models.BooleanField(default=True)
class AIEvaluation(TimeStampedModel):policy=models.ForeignKey(AISafetyPolicy,related_name='evaluations',on_delete=models.PROTECT);input_hash=models.CharField(max_length=64);output=models.JSONField(default=dict);evidence=models.JSONField(default=list);confidence=models.DecimalField(max_digits=5,decimal_places=4,null=True);decision=models.CharField(max_length=30);explanation_summary=models.TextField(blank=True);policies_used=models.JSONField(default=list)
class AIApproval(TimeStampedModel):evaluation=models.OneToOneField(AIEvaluation,related_name='approval',on_delete=models.CASCADE);status=models.CharField(max_length=30,default='pending');reviewer=models.CharField(max_length=180,blank=True);comments=models.TextField(blank=True)
