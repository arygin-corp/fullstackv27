from collections import Counter,defaultdict
from django.db.models import Avg,F,DurationField,ExpressionWrapper
from ..models import TransitionEvent,WorkflowInstance
class ProcessMiningService:
 @staticmethod
 def variants(workflow):
  paths=defaultdict(list)
  for e in TransitionEvent.objects.filter(instance__workflow=workflow).select_related('transition').order_by('instance_id','occurred_at'):
   paths[e.instance_id].append(e.transition.key if e.transition else e.event_type)
  counts=Counter(tuple(v) for v in paths.values())
  return [{'path':list(path),'count':count} for path,count in counts.most_common()]
 @staticmethod
 def rework(workflow):
  repeated=0
  for path in ProcessMiningService.variants(workflow):
   if len(path['path'])!=len(set(path['path'])):repeated+=path['count']
  return {'instances_with_repeated_transitions':repeated}
