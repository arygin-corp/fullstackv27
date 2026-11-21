from collections import defaultdict,Counter
class ProcessDiscoveryProvider:
 def infer(self,activities,context):raise NotImplementedError
class LocalProcessMiner:
 @staticmethod
 def variants(activities):
  cases=defaultdict(list)
  for item in activities.order_by('case_key','occurred_at'):cases[item.case_key].append(item.activity)
  return [{'path':list(path),'count':count} for path,count in Counter(tuple(v) for v in cases.values()).most_common()]
