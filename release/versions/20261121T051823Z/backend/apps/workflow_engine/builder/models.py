from django.conf import settings
from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
class BuildProject(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT);status=models.CharField(max_length=30,default='draft');requirements=models.JSONField(default=dict);blueprint=models.JSONField(default=dict);validation=models.JSONField(default=dict)
class BuildRevision(TimeStampedModel):project=models.ForeignKey(BuildProject,related_name='revisions',on_delete=models.CASCADE);number=models.PositiveIntegerField();blueprint=models.JSONField(default=dict);change_summary=models.TextField(blank=True);created_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
class BuildChecklist(TimeStampedModel):project=models.OneToOneField(BuildProject,related_name='checklist',on_delete=models.CASCADE);forms_ready=models.BooleanField(default=False);rules_ready=models.BooleanField(default=False);roles_ready=models.BooleanField(default=False);sla_ready=models.BooleanField(default=False);tests_passed=models.BooleanField(default=False);security_reviewed=models.BooleanField(default=False);publish_approved=models.BooleanField(default=False)
