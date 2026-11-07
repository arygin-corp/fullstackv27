from django.conf import settings
from django.contrib.auth.models import Group
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class IdentityProvider(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=150);provider_type=models.CharField(max_length=50);issuer=models.CharField(max_length=255);configuration=models.JSONField(default=dict);enabled=models.BooleanField(default=True)
class ExternalIdentity(TimeStampedModel):provider=models.ForeignKey(IdentityProvider,on_delete=models.CASCADE);user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE);subject=models.CharField(max_length=255);claims=models.JSONField(default=dict)
class AttributeGrant(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);group=models.ForeignKey(Group,null=True,blank=True,on_delete=models.CASCADE);attribute=models.CharField(max_length=120);operator=models.CharField(max_length=30,default='eq');value=models.JSONField();action=models.CharField(max_length=80);resource_type=models.CharField(max_length=80)
