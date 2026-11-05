import hashlib,json
from django.core.exceptions import PermissionDenied
from .models import ArchivedInstance
class ArchiveService:
 @staticmethod
 def archive(instance):
  if instance.legal_holds.filter(active=True).exists():raise PermissionDenied('Instance is under legal hold.')
  snapshot={'id':instance.pk,'workflow':instance.workflow.key,'state':instance.current_state.key,'status':instance.status,'context':instance.context,'events':list(instance.events.values())};digest=hashlib.sha256(json.dumps(snapshot,sort_keys=True,default=str).encode()).hexdigest();return ArchivedInstance.objects.create(tenant=instance.tenant,original_id=str(instance.pk),workflow_key=instance.workflow.key,snapshot=snapshot,archive_hash=digest)
