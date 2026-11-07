import hashlib,json
from django.utils import timezone
from ..platform_models import DeploymentPackage
from ..services import ExportService
class DeploymentService:
 @staticmethod
 def package(workflow,environment,tenant=None):
  payload=ExportService.export(workflow);checksum=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest();return DeploymentPackage.objects.create(tenant=tenant,workflow=workflow,environment=environment,package=payload,checksum=checksum)
 @staticmethod
 def mark_deployed(package,user=None):package.status='deployed';package.deployed_at=timezone.now();package.deployed_by=user;package.save();return package
