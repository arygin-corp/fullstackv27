from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class LakeDestination(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);destination_type=models.CharField(max_length=80);configuration=models.JSONField(default=dict);secret_reference=models.CharField(max_length=255,blank=True);enabled=models.BooleanField(default=False)
class LakeExportJob(TimeStampedModel):destination=models.ForeignKey(LakeDestination,related_name='jobs',on_delete=models.PROTECT);dataset=models.CharField(max_length=120);window_start=models.DateTimeField();window_end=models.DateTimeField();status=models.CharField(max_length=30,default='queued');row_count=models.PositiveBigIntegerField(default=0);checkpoint=models.JSONField(default=dict);error=models.TextField(blank=True)
class LakeSchema(TimeStampedModel):dataset=models.CharField(max_length=120);version=models.PositiveIntegerField();schema=models.JSONField(default=dict);partitioning=models.JSONField(default=dict);retention=models.JSONField(default=dict)
