class WorkflowGPS:
 @staticmethod
 def choose(options,strategy='balanced'):
  options=list(options)
  if not options:return None
  if strategy=='fastest':return min(options,key=lambda x:x.estimated_duration or float('inf'))
  if strategy=='lowest_cost':return min(options,key=lambda x:x.estimated_cost or float('inf'))
  if strategy=='lowest_risk':return min(options,key=lambda x:x.risk_score or float('inf'))
  return min(options,key=lambda x:(float(x.estimated_duration or 0)+float(x.estimated_cost or 0)+float(x.risk_score or 0)))
