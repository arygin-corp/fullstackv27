class WorkflowClient:
 def __init__(self,transport):self.transport=transport
 def start(self,workflow_key,context=None,idempotency_key=None):return self.transport.post('/instances/start/',{'workflow_key':workflow_key,'context':context or {}},headers={'Idempotency-Key':idempotency_key} if idempotency_key else {})
 def transition(self,instance_id,key,payload=None,idempotency_key=None):return self.transport.post(f'/instances/{instance_id}/transition/',{'transition_key':key,'payload':payload or {}},headers={'Idempotency-Key':idempotency_key} if idempotency_key else {})
