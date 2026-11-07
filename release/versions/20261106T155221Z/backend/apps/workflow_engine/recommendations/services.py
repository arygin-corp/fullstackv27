from .models import OptimizationRecommendation
from ..analytics.process_mining import ProcessMiningService
class RecommendationService:
 @staticmethod
 def analyze(workflow):
  rework=ProcessMiningService.rework(workflow);items=[]
  if rework.get('instances_with_repeated_transitions',0)>0:items.append(OptimizationRecommendation.objects.create(workflow=workflow,kind='rework',title='Review repeated transition paths',evidence=rework,proposal={'action':'inspect_rework_paths'}))
  return items
