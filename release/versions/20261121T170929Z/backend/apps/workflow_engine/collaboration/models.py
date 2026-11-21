from django.db import models
from ..models import TimeStampedModel,WorkflowInstance
from ..platform_models import Tenant
class CollaborationChannel(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);provider=models.CharField(max_length=80);name=models.CharField(max_length=180);external_id=models.CharField(max_length=255);configuration=models.JSONField(default=dict);enabled=models.BooleanField(default=False)
class InteractiveCard(TimeStampedModel):channel=models.ForeignKey(CollaborationChannel,on_delete=models.CASCADE);instance=models.ForeignKey(WorkflowInstance,null=True,blank=True,on_delete=models.CASCADE);card_type=models.CharField(max_length=80);payload=models.JSONField(default=dict);external_message_id=models.CharField(max_length=255,blank=True);status=models.CharField(max_length=30,default='draft')
class CollaborationAction(TimeStampedModel):card=models.ForeignKey(InteractiveCard,related_name='actions',on_delete=models.CASCADE);actor_external_id=models.CharField(max_length=255);action=models.CharField(max_length=100);payload=models.JSONField(default=dict);verified=models.BooleanField(default=False)
