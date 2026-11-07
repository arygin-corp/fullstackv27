from django.conf import settings
from django.db import models
from ..models import TimeStampedModel,WorkflowInstance
class ReplaySession(TimeStampedModel):instance=models.ForeignKey(WorkflowInstance,related_name='replay_sessions',on_delete=models.CASCADE);requested_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);target_sequence=models.PositiveIntegerField(null=True,blank=True);target_time=models.DateTimeField(null=True,blank=True);status=models.CharField(max_length=30,default='ready');reconstructed_state=models.JSONField(default=dict)
class ReplayAnnotation(TimeStampedModel):session=models.ForeignKey(ReplaySession,related_name='annotations',on_delete=models.CASCADE);sequence=models.PositiveIntegerField();note=models.TextField();author=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
