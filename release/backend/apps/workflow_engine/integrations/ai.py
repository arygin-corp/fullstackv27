import hashlib,json
from ..platform_models import AIInteraction
class AIProvider:
 def generate_json(self,prompt,schema): raise NotImplementedError
class WorkflowAssistant:
 def __init__(self,provider,provider_name='custom',model='configured'): self.provider=provider;self.provider_name=provider_name;self.model=model
 def draft_workflow(self,*,description,user=None,tenant=None):
  schema={'workflow':{},'states':[],'transitions':[],'risks':[]};result=self.provider.generate_json(description,schema)
  AIInteraction.objects.create(tenant=tenant,user=user,purpose='workflow_generation',provider=self.provider_name,model=self.model,prompt_hash=hashlib.sha256(description.encode()).hexdigest(),response=result,safety_metadata={'human_review_required':True})
  return result
