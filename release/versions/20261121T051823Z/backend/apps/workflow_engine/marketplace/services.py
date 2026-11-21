import hashlib,json
from django.db import transaction
from .models import PackageInstallation,WorkflowPackage
class MarketplaceService:
 @staticmethod
 def build(*,workflow,tenant=None):
  from ..workflows.services import ExportService
  artifact=ExportService.export(workflow);manifest={'name':workflow.name,'key':workflow.key,'version':workflow.version};checksum=hashlib.sha256(json.dumps(artifact,sort_keys=True).encode()).hexdigest();return WorkflowPackage.objects.create(tenant=tenant,workflow=workflow,name=workflow.name,key=workflow.key,version=str(workflow.version),manifest=manifest,artifact=artifact,checksum=checksum)
 @staticmethod
 @transaction.atomic
 def install(*,package,tenant,configuration=None):
  actual=hashlib.sha256(json.dumps(package.artifact,sort_keys=True).encode()).hexdigest()
  if actual!=package.checksum:raise ValueError('Package checksum mismatch')
  installation=PackageInstallation.objects.create(tenant=tenant,package=package,installed_version=package.version,configuration=configuration or {});WorkflowPackage.objects.filter(pk=package.pk).update();return installation
