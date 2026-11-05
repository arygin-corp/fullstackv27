from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class TelemetryEvent(models.Model):
    tenant=models.ForeignKey(Tenant,null=True,on_delete=models.SET_NULL);trace_id=models.CharField(max_length=64,db_index=True);span_id=models.CharField(max_length=32,db_index=True);parent_span_id=models.CharField(max_length=32,blank=True);service=models.CharField(max_length=120);operation=models.CharField(max_length=160);status=models.CharField(max_length=30);duration_ms=models.DecimalField(max_digits=14,decimal_places=3,null=True);attributes=models.JSONField(default=dict);occurred_at=models.DateTimeField(auto_now_add=True,db_index=True)
class MetricSample(models.Model):
    tenant=models.ForeignKey(Tenant,null=True,on_delete=models.SET_NULL);name=models.CharField(max_length=160,db_index=True);value=models.DecimalField(max_digits=20,decimal_places=6);unit=models.CharField(max_length=40,blank=True);labels=models.JSONField(default=dict);recorded_at=models.DateTimeField(auto_now_add=True,db_index=True)
class AlertRule(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);name=models.CharField(max_length=180);metric=models.CharField(max_length=160);operator=models.CharField(max_length=20);threshold=models.DecimalField(max_digits=20,decimal_places=6);window_seconds=models.PositiveIntegerField(default=300);severity=models.CharField(max_length=30,default='warning');enabled=models.BooleanField(default=True);routing=models.JSONField(default=dict)
class AlertIncident(TimeStampedModel):rule=models.ForeignKey(AlertRule,related_name='incidents',on_delete=models.PROTECT);status=models.CharField(max_length=30,default='open');summary=models.CharField(max_length=255);evidence=models.JSONField(default=dict);acknowledged_by=models.CharField(max_length=120,blank=True);resolved_at=models.DateTimeField(null=True,blank=True)
class ServiceLevelObjective(TimeStampedModel):
    name=models.CharField(max_length=180);service=models.CharField(max_length=120);indicator=models.CharField(max_length=160);target=models.DecimalField(max_digits=8,decimal_places=5);window_days=models.PositiveIntegerField(default=30);error_budget_policy=models.JSONField(default=dict)
