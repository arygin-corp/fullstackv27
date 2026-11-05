from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class OperationalCommand(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);kind=models.CharField(max_length=80);target_type=models.CharField(max_length=80);target_id=models.CharField(max_length=100);parameters=models.JSONField(default=dict);status=models.CharField(max_length=30,default='pending');requested_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);approved_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,related_name='+',on_delete=models.SET_NULL);result=models.JSONField(default=dict);error=models.TextField(blank=True)
class Runbook(TimeStampedModel):name=models.CharField(max_length=180);key=models.SlugField(unique=True);description=models.TextField();steps=models.JSONField(default=list);required_role=models.CharField(max_length=80);active=models.BooleanField(default=True)
class IncidentTimeline(models.Model):incident_key=models.CharField(max_length=120,db_index=True);event=models.CharField(max_length=160);details=models.JSONField(default=dict);occurred_at=models.DateTimeField(auto_now_add=True);actor=models.CharField(max_length=160,blank=True)
class FeatureFlag(TimeStampedModel):key=models.SlugField(unique=True);enabled=models.BooleanField(default=False);tenant_allowlist=models.JSONField(default=list);percentage=models.PositiveSmallIntegerField(default=0);configuration=models.JSONField(default=dict)
class MaintenanceWindow(TimeStampedModel):tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);starts_at=models.DateTimeField();ends_at=models.DateTimeField();scope=models.JSONField(default=dict);reason=models.TextField();active=models.BooleanField(default=True)
