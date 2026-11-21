from django.db import models
from ..models import TimeStampedModel,WorkflowDefinition
from ..platform_models import Tenant
class MarketplaceCategory(TimeStampedModel):name=models.CharField(max_length=120);key=models.SlugField(unique=True);description=models.TextField(blank=True)
class WorkflowPackage(TimeStampedModel):
 tenant=models.ForeignKey(Tenant,null=True,blank=True,on_delete=models.CASCADE);workflow=models.ForeignKey(WorkflowDefinition,null=True,blank=True,on_delete=models.SET_NULL);name=models.CharField(max_length=180);key=models.SlugField();version=models.CharField(max_length=40);manifest=models.JSONField(default=dict);artifact=models.JSONField(default=dict);checksum=models.CharField(max_length=64);status=models.CharField(max_length=30,default='draft');is_public=models.BooleanField(default=False)
 class Meta:constraints=[models.UniqueConstraint(fields=('tenant','key','version'),name='uq_marketplace_package')]
class MarketplaceListing(TimeStampedModel):
 package=models.OneToOneField(WorkflowPackage,related_name='listing',on_delete=models.CASCADE);category=models.ForeignKey(MarketplaceCategory,null=True,on_delete=models.SET_NULL);summary=models.TextField();documentation=models.TextField(blank=True);install_count=models.PositiveIntegerField(default=0);rating=models.DecimalField(max_digits=3,decimal_places=2,null=True,blank=True)
class PackageInstallation(TimeStampedModel):tenant=models.ForeignKey(Tenant,on_delete=models.CASCADE);package=models.ForeignKey(WorkflowPackage,on_delete=models.PROTECT);installed_version=models.CharField(max_length=40);configuration=models.JSONField(default=dict);status=models.CharField(max_length=30,default='installed')
