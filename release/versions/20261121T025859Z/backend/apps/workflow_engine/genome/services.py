from decimal import Decimal
from .models import WorkflowGenome
class GenomeService:
 @staticmethod
 def calculate(workflow):
  states=workflow.states.count();transitions=workflow.transitions.count();guards=workflow.transitions.exclude(guard_path='').count();complexity=min(100,states*4+transitions*3+guards*2);automation=min(100,workflow.transitions.exclude(action_key='').count()*10);governance=min(100,workflow.access_policies.count()*10+workflow.sla_rules.count()*5);risk=min(100,complexity*.4+guards*2);ai=min(100,workflow.settings.get('ai_readiness',0));return WorkflowGenome.objects.update_or_create(workflow=workflow,defaults={'complexity':Decimal(str(complexity)),'risk':Decimal(str(risk)),'cost':Decimal('0'),'automation':Decimal(str(automation)),'governance':Decimal(str(governance)),'ai_readiness':Decimal(str(ai)),'features':{'states':states,'transitions':transitions,'guards':guards}})[0]
