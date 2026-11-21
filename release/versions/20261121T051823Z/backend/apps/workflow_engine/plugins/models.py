from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class Plugin(TimeStampedModel):name=models.CharField(max_length=160);key=models.SlugField(unique=True);provider=models.CharField(max_length=160);description=models.TextField(blank=True);active=models.BooleanField(default=True)
class PluginVersion(TimeStampedModel):plugin=models.ForeignKey(Plugin,related_name='versions',on_delete=models.CASCADE);version=models.CharField(max_length=40);manifest=models.JSONField(default=dict);entrypoint=models.CharField(max_length=255);checksum=models.CharField(max_length=64);signature=models.TextField(blank=True);status=models.CharField(max_length=30,default='draft')
class PluginInstallation(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);version=models.ForeignKey(PluginVersion,on_delete=models.PROTECT);configuration=models.JSONField(default=dict);secret_reference=models.CharField(max_length=255,blank=True);enabled=models.BooleanField(default=True)
class ConnectorAction(TimeStampedModel):plugin=models.ForeignKey(Plugin,on_delete=models.CASCADE);key=models.SlugField();name=models.CharField(max_length=160);input_schema=models.JSONField(default=dict);output_schema=models.JSONField(default=dict);required_scopes=models.JSONField(default=list)
