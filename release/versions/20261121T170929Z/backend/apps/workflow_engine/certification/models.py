from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class Publisher(TimeStampedModel):
 tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);name=models.CharField(max_length=180);publisher_type=models.CharField(max_length=40);status=models.CharField(max_length=30,default='pending');verified=models.BooleanField(default=False);security_contact=models.EmailField(blank=True);metadata=models.JSONField(default=dict)
class CertificationProfile(TimeStampedModel):
 name=models.CharField(max_length=180);artifact_type=models.CharField(max_length=60);requirements=models.JSONField(default=list);validity_days=models.PositiveIntegerField(default=365);active=models.BooleanField(default=True)
class CertificationReview(TimeStampedModel):
 publisher=models.ForeignKey(Publisher,null=True,on_delete=models.SET_NULL);profile=models.ForeignKey(CertificationProfile,on_delete=models.PROTECT);artifact_type=models.CharField(max_length=60);artifact_key=models.CharField(max_length=180);artifact_version=models.CharField(max_length=60);status=models.CharField(max_length=30,default='submitted');evidence=models.JSONField(default=dict);findings=models.JSONField(default=list);reviewer=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);expires_at=models.DateTimeField(null=True,blank=True)
class DeprecationNotice(TimeStampedModel):artifact_type=models.CharField(max_length=60);artifact_key=models.CharField(max_length=180);version=models.CharField(max_length=60);replacement=models.JSONField(default=dict);effective_at=models.DateTimeField();retire_at=models.DateTimeField(null=True);message=models.TextField()
