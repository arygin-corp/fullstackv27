from django.conf import settings
from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition,WorkflowInstance,WorkflowState
class DynamicForm(TimeStampedModel):
 workflow=models.ForeignKey(WorkflowDefinition,related_name='forms',null=True,blank=True,on_delete=models.CASCADE);name=models.CharField(max_length=160);key=models.SlugField();version=models.PositiveIntegerField(default=1);status=models.CharField(max_length=30,default='draft');schema=models.JSONField(default=dict);ui_schema=models.JSONField(default=dict);validation_schema=models.JSONField(default=dict)
 class Meta: constraints=[models.UniqueConstraint(fields=('workflow','key','version'),name='uq_dynamic_form_version')]
class FormField(TimeStampedModel):
 form=models.ForeignKey(DynamicForm,related_name='fields',on_delete=models.CASCADE);key=models.SlugField();label=models.CharField(max_length=180);field_type=models.CharField(max_length=50);position=models.PositiveIntegerField(default=0);required=models.BooleanField(default=False);configuration=models.JSONField(default=dict);visibility_rule=models.JSONField(default=dict)
 class Meta:ordering=('position',);constraints=[models.UniqueConstraint(fields=('form','key'),name='uq_form_field')]
class FormSubmission(TimeStampedModel):
 form=models.ForeignKey(DynamicForm,related_name='submissions',on_delete=models.PROTECT);instance=models.ForeignKey(WorkflowInstance,related_name='form_submissions',null=True,blank=True,on_delete=models.CASCADE);submitted_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);status=models.CharField(max_length=30,default='draft');data=models.JSONField(default=dict);validation_errors=models.JSONField(default=list);submitted_at=models.DateTimeField(null=True,blank=True)
