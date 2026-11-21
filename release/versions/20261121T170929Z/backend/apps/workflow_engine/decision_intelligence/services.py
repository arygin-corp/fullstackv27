from ..core.conditions import evaluate
class DecisionService:
 @staticmethod
 def execute(model,facts):
  if model.model_type=='rules':
   for rule in model.definition.get('rules',[]):
    if evaluate(rule.get('when',{}),facts):return {'decision':rule.get('then'),'rule':rule.get('name')}
   return {'decision':model.definition.get('default')}
  raise NotImplementedError('Configure a provider for this decision model type.')
