from django.db.models import Q
class KnowledgeFabricService:
 @staticmethod
 def search(queryset,text):return queryset.filter(Q(name__icontains=text)|Q(properties__icontains=text))
 @staticmethod
 def neighborhood(entity,depth=2):
  result=[];frontier=[entity];seen={entity.pk}
  for _ in range(depth):
   nxt=[]
   for node in frontier:
    for rel in node.outgoing.select_related('target'):
     result.append({'source':node.pk,'relationship':rel.relationship,'target':rel.target_id})
     if rel.target_id not in seen:seen.add(rel.target_id);nxt.append(rel.target)
   frontier=nxt
  return result
