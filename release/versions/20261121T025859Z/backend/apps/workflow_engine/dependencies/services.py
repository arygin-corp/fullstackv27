class DependencyService:
 @staticmethod
 def impact(node,max_depth=10):
  found=[];frontier=[node];seen={node.pk}
  for _ in range(max_depth):
   nxt=[]
   for current in frontier:
    for edge in current.dependents.select_related('source'):
     if edge.source_id not in seen:seen.add(edge.source_id);found.append({'node':edge.source.key,'kind':edge.source.kind,'relationship':edge.relationship});nxt.append(edge.source)
   if not nxt:break
   frontier=nxt
  return found
