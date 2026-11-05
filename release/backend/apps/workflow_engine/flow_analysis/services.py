from collections import defaultdict
class FlowAnalyzer:
 @staticmethod
 def cycles(nodes,edges):
  graph=defaultdict(list)
  for e in edges:graph[e.source].append(e.target)
  visiting=set();visited=set();cycles=[]
  def walk(node,path):
   if node in visiting:cycles.append(path[path.index(node):]+[node]);return
   if node in visited:return
   visiting.add(node)
   for nxt in graph[node]:walk(nxt,path+[nxt])
   visiting.remove(node);visited.add(node)
  for n in nodes:walk(n.node_id,[n.node_id])
  return cycles
 @staticmethod
 def optimization_candidates(flow):
  nodes=list(flow.nodes.all());edges=list(flow.edges.all());items=[]
  cycles=FlowAnalyzer.cycles(nodes,edges)
  if cycles:items.append({'kind':'cycle','evidence':cycles,'recommendation':'Add an explicit loop bound or exit condition.'})
  return items
