class ChaosProvider:
 def inject(self,experiment):raise NotImplementedError
 def rollback(self,experiment):raise NotImplementedError
class ChaosService:
 @staticmethod
 def run(run,provider):
  if not run.experiment.enabled:raise PermissionError('Chaos experiment is disabled.')
  run.status='running';run.save()
  try:run.result=provider.inject(run.experiment);run.status='completed';run.save();provider.rollback(run.experiment);return run
  except Exception as exc:run.status='failed';run.error=str(exc);run.save();provider.rollback(run.experiment);raise
