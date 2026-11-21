import hashlib,json
from django.db import transaction
from .models import AgentInstallation
class AgentMarketplaceService:
 @staticmethod
 @transaction.atomic
 def install(package,tenant,configuration=None):
  digest=hashlib.sha256(json.dumps(package.manifest,sort_keys=True).encode()).hexdigest()
  if digest!=package.checksum:raise ValueError('Agent package checksum mismatch.')
  if package.status!='published' or not package.verified:raise PermissionError('Agent package is not approved for installation.')
  return AgentInstallation.objects.create(tenant=tenant,package=package,configuration=configuration or {},tool_allowlist=package.tool_requirements,enabled=False)
