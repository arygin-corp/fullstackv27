from ..conditions import evaluate
from ..platform_models import BusinessRule
class RuleEngine:
 @staticmethod
 def evaluate(key,facts,tenant=None,version=None):
  q=BusinessRule.objects.filter(key=key,active=True,tenant=tenant)
  if version:q=q.filter(version=version)
  rule=q.order_by('-version').first()
  if not rule:raise LookupError('Rule not found')
  return evaluate(rule.expression,facts)
