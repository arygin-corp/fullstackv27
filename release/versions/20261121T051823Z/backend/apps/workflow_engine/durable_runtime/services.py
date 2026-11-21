import hashlib,json
from django.db import transaction
from django.utils import timezone
from .models import ExecutionCheckpoint
class DurableRuntime:
 @staticmethod
 @transaction.atomic
 def checkpoint(execution,sequence):
  state={'context':execution.context,'current_nodes':execution.current_nodes,'status':execution.status};checksum=hashlib.sha256(json.dumps(state,sort_keys=True,default=str).encode()).hexdigest();return ExecutionCheckpoint.objects.create(execution=execution,sequence=sequence,state=state,pending_nodes=execution.current_nodes,checksum=checksum)
 @staticmethod
 @transaction.atomic
 def restore(execution,checkpoint):
  digest=hashlib.sha256(json.dumps(checkpoint.state,sort_keys=True,default=str).encode()).hexdigest()
  if digest!=checkpoint.checksum:raise ValueError('Checkpoint integrity failure.')
  execution.context=checkpoint.state['context'];execution.current_nodes=checkpoint.state['current_nodes'];execution.status='running';execution.save();return execution
