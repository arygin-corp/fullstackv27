from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class MemoryNamespace(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();classification=models.CharField(max_length=60);retention_days=models.PositiveIntegerField(default=30);allowed_purposes=models.JSONField(default=list)
class MemoryRecord(TimeStampedModel):namespace=models.ForeignKey(MemoryNamespace,related_name='records',on_delete=models.CASCADE);subject_key=models.CharField(max_length=180,db_index=True);memory_type=models.CharField(max_length=80);content=models.JSONField(default=dict);source_reference=models.CharField(max_length=255,blank=True);expires_at=models.DateTimeField(null=True,blank=True);approved=models.BooleanField(default=False)
class MemoryAccessLog(models.Model):record=models.ForeignKey(MemoryRecord,related_name='access_logs',on_delete=models.CASCADE);user=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);purpose=models.CharField(max_length=120);accessed_at=models.DateTimeField(auto_now_add=True);allowed=models.BooleanField(default=False)
