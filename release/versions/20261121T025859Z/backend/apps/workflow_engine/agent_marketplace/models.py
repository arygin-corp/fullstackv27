from django.db import models
from ..models import TimeStampedModel
from ..platform_models import Tenant
from ..agents.models import AgentDefinition
class AgentPackage(TimeStampedModel):
    agent=models.ForeignKey(AgentDefinition,related_name='packages',on_delete=models.CASCADE);name=models.CharField(max_length=180);key=models.SlugField();version=models.CharField(max_length=40);manifest=models.JSONField(default=dict);tool_requirements=models.JSONField(default=list);policy_requirements=models.JSONField(default=list);checksum=models.CharField(max_length=64);signature=models.TextField(blank=True);status=models.CharField(max_length=30,default='draft');verified=models.BooleanField(default=False)
class AgentListing(TimeStampedModel):
    package=models.OneToOneField(AgentPackage,related_name='listing',on_delete=models.CASCADE);category=models.CharField(max_length=100);summary=models.TextField();documentation=models.TextField(blank=True);risk_disclosure=models.JSONField(default=dict);install_count=models.PositiveIntegerField(default=0)
class AgentInstallation(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);package=models.ForeignKey(AgentPackage,on_delete=models.PROTECT);configuration=models.JSONField(default=dict);tool_allowlist=models.JSONField(default=list);enabled=models.BooleanField(default=False);review_status=models.CharField(max_length=30,default='pending')
class AgentRating(TimeStampedModel):
    tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);package=models.ForeignKey(AgentPackage,related_name='ratings',on_delete=models.CASCADE);rating=models.PositiveSmallIntegerField();review=models.TextField(blank=True);approved=models.BooleanField(default=False)
