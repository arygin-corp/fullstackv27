from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
from ..platform_models import Tenant
class ServiceOffering(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();description=models.TextField();workflow=models.ForeignKey(WorkflowDefinition,on_delete=models.PROTECT);icon=models.CharField(max_length=100,blank=True);category=models.CharField(max_length=100,blank=True);audience_rule=models.JSONField(default=dict);featured=models.BooleanField(default=False);active=models.BooleanField(default=True)
class PortalCollection(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=160);key=models.SlugField();offerings=models.ManyToManyField(ServiceOffering,related_name='collections');position=models.PositiveIntegerField(default=0)
class SavedRequest(TimeStampedModel):offering=models.ForeignKey(ServiceOffering,on_delete=models.CASCADE);owner_id=models.CharField(max_length=100);draft=models.JSONField(default=dict);status=models.CharField(max_length=30,default='draft')
