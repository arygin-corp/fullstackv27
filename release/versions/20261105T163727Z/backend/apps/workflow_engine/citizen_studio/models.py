from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class CitizenProject(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT);status=models.CharField(max_length=30,default='draft');canvas=models.JSONField(default=dict);guided_mode=models.BooleanField(default=True);risk_tier=models.CharField(max_length=30,default='low')
class StudioComponent(TimeStampedModel):name=models.CharField(max_length=160);key=models.SlugField(unique=True);category=models.CharField(max_length=80);schema=models.JSONField(default=dict);ui_schema=models.JSONField(default=dict);requires_review=models.BooleanField(default=False)
class CitizenPublishRequest(TimeStampedModel):project=models.ForeignKey(CitizenProject,related_name='publish_requests',on_delete=models.CASCADE);status=models.CharField(max_length=30,default='pending');validation=models.JSONField(default=dict);security_review=models.JSONField(default=dict);approved_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,related_name='+',on_delete=models.SET_NULL)
