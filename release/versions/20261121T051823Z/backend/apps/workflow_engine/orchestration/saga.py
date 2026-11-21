from django.db import transaction
from ..actions import ActionRegistry
from ..platform_models import SagaStep
class SagaRunner:
 @staticmethod
 @transaction.atomic
 def run(saga):
  completed=[]
  try:
   for step in saga.steps.select_for_update().filter(status='pending'):
    step.result=ActionRegistry.execute(step.action_key,saga=saga,step=step) or {};step.status='completed';step.save();completed.append(step)
   saga.status='completed';saga.save();return saga
  except Exception as exc:
   saga.status='compensating';saga.save()
   for step in reversed(completed):
    if step.compensation_key: ActionRegistry.execute(step.compensation_key,saga=saga,step=step)
    step.status='compensated';step.save()
   saga.status='failed';saga.context={**saga.context,'error':str(exc)};saga.save();raise
