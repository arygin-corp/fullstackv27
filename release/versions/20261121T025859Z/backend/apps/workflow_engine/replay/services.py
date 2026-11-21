class ReplayService:
 @staticmethod
 def reconstruct(instance,sequence=None,target_time=None):
  state={'workflow':instance.workflow.key,'context':{},'state':None,'events':[]};events=instance.events.order_by('occurred_at','pk')
  if target_time:events=events.filter(occurred_at__lte=target_time)
  for idx,event in enumerate(events,1):
   if sequence and idx>sequence:break
   state['state']=event.target_state.key;state['context']=event.context_after;state['events'].append({'sequence':idx,'type':event.event_type,'transition':event.transition.key if event.transition else None})
  return state
