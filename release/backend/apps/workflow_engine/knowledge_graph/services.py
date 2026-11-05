from collections import deque
from .models import GraphEdge
class GraphService:
 @staticmethod
 def neighbors(node,relationship=None):
  q=GraphEdge.objects.filter(source=node).select_related('target');q=q.filter(relationship=relationship) if relationship else q;return [e.target for e in q]
 @staticmethod
 def shortest_path(source,target,max_depth=8):
  queue=deque([(source,[source.pk])]);seen={source.pk}
  while queue:
   node,path=queue.popleft()
   if node.pk==target.pk:return path
   if len(path)>max_depth:continue
   for neighbor in GraphService.neighbors(node):
    if neighbor.pk not in seen:seen.add(neighbor.pk);queue.append((neighbor,path+[neighbor.pk]))
  return []
