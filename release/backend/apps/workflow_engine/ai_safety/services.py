from ..core.conditions import evaluate
class SafetyEngine:
 @staticmethod
 def evaluate(policy,facts):
  violations=[]
  for rule in policy.rules:
   if evaluate(rule.get('when',{}),facts):violations.append({'rule':rule.get('name'),'message':rule.get('message'),'severity':rule.get('severity','high')})
  return {'allowed':not violations or not policy.block_on_failure,'violations':violations}
