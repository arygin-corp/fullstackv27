class ControlExecutor:
 def execute(self,run):raise NotImplementedError
class ControlAutomationService:
 @staticmethod
 def run(run,executor):
  if not run.automation.enabled:raise PermissionError('Control automation is disabled.')
  run.status='running';run.save()
  try:run.output=executor.execute(run);run.evidence={'output':run.output};run.status='passed';run.save();return run
  except Exception as exc:run.status='failed';run.error=str(exc);run.save();raise
