from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class Connector(TimeStampedModel):
    name=models.CharField(max_length=180);key=models.SlugField(unique=True);publisher=models.CharField(max_length=180);description=models.TextField(blank=True);category=models.CharField(max_length=80);logo=models.URLField(blank=True);documentation_url=models.URLField(blank=True);status=models.CharField(max_length=30,default='draft');verified=models.BooleanField(default=False)
class ConnectorVersion(TimeStampedModel):
    connector=models.ForeignKey(Connector,related_name='versions',on_delete=models.CASCADE);version=models.CharField(max_length=40);manifest=models.JSONField(default=dict);auth_type=models.CharField(max_length=40);triggers=models.JSONField(default=list);actions=models.JSONField(default=list);searches=models.JSONField(default=list);checksum=models.CharField(max_length=64);signature=models.TextField(blank=True);status=models.CharField(max_length=30,default='draft')
class ConnectorInstallation(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);version=models.ForeignKey(ConnectorVersion,on_delete=models.PROTECT);name=models.CharField(max_length=180);configuration=models.JSONField(default=dict);secret_reference=models.CharField(max_length=255);enabled=models.BooleanField(default=True);health=models.CharField(max_length=30,default='unknown');last_checked_at=models.DateTimeField(null=True,blank=True)
class ConnectorReview(TimeStampedModel):
    connector=models.ForeignKey(Connector,related_name='reviews',on_delete=models.CASCADE);tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);rating=models.PositiveSmallIntegerField();title=models.CharField(max_length=180);body=models.TextField(blank=True);approved=models.BooleanField(default=False)
class ConnectorCertification(TimeStampedModel):
    connector=models.ForeignKey(Connector,related_name='certifications',on_delete=models.CASCADE);review_type=models.CharField(max_length=80);status=models.CharField(max_length=30);evidence=models.JSONField(default=dict);expires_at=models.DateTimeField(null=True,blank=True)
