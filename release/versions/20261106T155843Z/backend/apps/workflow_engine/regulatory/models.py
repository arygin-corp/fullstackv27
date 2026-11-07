from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class RegulatoryPack(TimeStampedModel):name=models.CharField(max_length=180);key=models.SlugField();version=models.CharField(max_length=40);jurisdiction=models.CharField(max_length=100,blank=True);framework=models.CharField(max_length=100);manifest=models.JSONField(default=dict);controls=models.JSONField(default=list);workflows=models.JSONField(default=list);status=models.CharField(max_length=30,default='draft')
class RegulatoryPackInstallation(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);pack=models.ForeignKey(RegulatoryPack,on_delete=models.PROTECT);configuration=models.JSONField(default=dict);status=models.CharField(max_length=30,default='installed');assessment=models.JSONField(default=dict)
