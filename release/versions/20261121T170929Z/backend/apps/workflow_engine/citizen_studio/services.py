class CitizenStudioService:
 @staticmethod
 def readiness(project):
  nodes=project.canvas.get('nodes',[]);errors=[]
  if not nodes:errors.append('Add at least one process step.')
  if not any(n.get('kind')=='start' for n in nodes):errors.append('Add a start step.')
  if not any(n.get('kind')=='end' for n in nodes):errors.append('Add an end step.')
  return {'ready':not errors,'errors':errors,'risk_tier':project.risk_tier}
