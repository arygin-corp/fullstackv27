from collections import deque
from django.conf import settings
from django.db.models import Q
from .models import Entity, EntityRelation, TimelineEvent

def graph_neighborhood(user, query="", entity_id=None, hops=None, max_nodes=None):
    hops=min(max(int(hops or settings.KNOWLEDGE_GRAPH_MAX_HOPS),0),3)
    max_nodes=min(max(int(max_nodes or settings.KNOWLEDGE_GRAPH_MAX_NODES),1),200)
    roots=Entity.objects.filter(owner=user)
    if entity_id: roots=roots.filter(pk=entity_id)
    elif query: roots=roots.filter(Q(canonical_name__icontains=query)|Q(description__icontains=query))
    else: roots=roots.order_by("-updated_at")
    root_ids=list(roots.values_list("id",flat=True)[:10])
    visited=set(root_ids); frontier=deque((entity_id,0) for entity_id in root_ids)
    relation_ids=set()
    while frontier and len(visited)<max_nodes:
        current,depth=frontier.popleft()
        if depth>=hops: continue
        relations=EntityRelation.objects.filter(owner=user).filter(Q(subject_id=current)|Q(object_id=current)).values("id","subject_id","object_id")[:max_nodes]
        for rel in relations:
            relation_ids.add(rel["id"])
            for next_id in (rel["subject_id"],rel["object_id"]):
                if next_id not in visited and len(visited)<max_nodes:
                    visited.add(next_id); frontier.append((next_id,depth+1))
    nodes=Entity.objects.filter(owner=user,id__in=visited)
    edges=EntityRelation.objects.filter(owner=user,id__in=relation_ids).select_related("subject","object","document")
    return {
        "nodes":[{"id":n.id,"type":n.entity_type,"name":n.canonical_name,"description":n.description} for n in nodes],
        "edges":[{"id":e.id,"source":e.subject_id,"target":e.object_id,"predicate":e.predicate,"document_id":e.document_id,"document_title":e.document.title,"evidence":e.evidence,"confidence":e.confidence} for e in edges],
    }

def graph_context(user, question):
    if not settings.KNOWLEDGE_GRAPH_ENABLED or not settings.KNOWLEDGE_GRAPH_RETRIEVAL_ENABLED:
        return "",[]
    graph=graph_neighborhood(user,query=question,hops=settings.KNOWLEDGE_GRAPH_MAX_HOPS,max_nodes=settings.KNOWLEDGE_GRAPH_MAX_NODES)
    lines=[]; citations=[]
    for edge in graph["edges"]:
        source=next((n for n in graph["nodes"] if n["id"]==edge["source"]),None)
        target=next((n for n in graph["nodes"] if n["id"]==edge["target"]),None)
        if not source or not target: continue
        lines.append(f"{source['name']} --{edge['predicate']}--> {target['name']} (Document: {edge['document_title']}) Evidence: {edge['evidence']}")
        citations.append({"document_id":edge["document_id"],"document_title":edge["document_title"],"relation_id":edge["id"]})
    return "\n".join(lines)[:settings.KNOWLEDGE_GRAPH_CONTEXT_MAX_CHARS],citations

def timeline_for_user(user, query="", event_type="", start=None, end=None):
    qs=TimelineEvent.objects.filter(owner=user).select_related("document").prefetch_related("entities")
    if query: qs=qs.filter(Q(title__icontains=query)|Q(description__icontains=query)|Q(evidence__icontains=query)|Q(entities__canonical_name__icontains=query)).distinct()
    if event_type: qs=qs.filter(event_type=event_type)
    if start: qs=qs.filter(event_date__gte=start)
    if end: qs=qs.filter(event_date__lte=end)
    return qs
