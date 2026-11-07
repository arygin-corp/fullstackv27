from django.db import transaction
class MultiAgentProvider:
 def execute(self,agent,payload,context):raise NotImplementedError
class MultiAgentOrchestrator:
 def __init__(self,provider):self.provider=provider
 @transaction.atomic
 def run(self,team_run):
  if not team_run.team.enabled:raise PermissionError('Agent team is disabled.')
  context=dict(team_run.shared_context);team_run.status='running';team_run.save()
  try:
   for member in team_run.team.members.select_related('agent').order_by('position'):
    result=self.provider.execute(member.agent,team_run.input,context);context[member.role]=result
   team_run.shared_context=context;team_run.status='awaiting_review' if team_run.requires_human_review else 'completed';team_run.save();return team_run
  except Exception as exc:team_run.status='failed';team_run.error=str(exc);team_run.save();raise
