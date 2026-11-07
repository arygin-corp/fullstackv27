class AgentProvider:
 def execute(self,definition,payload,tools):raise NotImplementedError
class AgentRuntime:
 def __init__(self,provider,tool_resolver):self.provider=provider;self.tool_resolver=tool_resolver
 def run(self,run):
  if not run.agent.enabled:raise PermissionError('Agent is disabled')
  tools={key:self.tool_resolver(key) for key in run.agent.allowed_tools};run.status='running';run.save();
  try:
   run.output=self.provider.execute(run.agent,run.input,tools);run.status='awaiting_review' if run.agent.requires_human_review else 'completed';run.save();return run
  except Exception as exc:run.status='failed';run.error=str(exc);run.save();raise
