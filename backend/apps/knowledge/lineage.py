from collections import deque
from django.conf import settings
from django.db.models import Q
from .models import LineageAsset, LineageChangeScenario, LineageEdge

class LineageError(ValueError): pass

def _bounded_depth(value):
    try: value=int(value)
    except (TypeError,ValueError): value=3
    return max(0,min(value,settings.LINEAGE_MAX_DEPTH))

def asset_search(user,query="",kind="",limit=50):
    qs=LineageAsset.objects.filter(owner=user,active=True).select_related("product")
    if query: qs=qs.filter(Q(name__icontains=query)|Q(external_id__icontains=query)|Q(qualified_name__icontains=query)|Q(system_name__icontains=query)|Q(description__icontains=query))
    if kind: qs=qs.filter(kind=kind)
    return qs[:min(max(int(limit),1),settings.LINEAGE_MAX_NODES)]

def neighborhood(user,asset_id,direction="both",depth=3,max_nodes=None):
    depth=_bounded_depth(depth); max_nodes=min(max(int(max_nodes or settings.LINEAGE_MAX_NODES),1),settings.LINEAGE_MAX_NODES)
    root=LineageAsset.objects.filter(owner=user,active=True,pk=int(asset_id)).first()
    if not root: raise LineageError("Lineage asset not found")
    visited={root.id}; queue=deque([(root.id,0)]); edge_ids=set(); levels={root.id:0}
    while queue and len(visited)<max_nodes:
        current,level=queue.popleft()
        if level>=depth: continue
        edge_qs=LineageEdge.objects.filter(owner=user,active=True)
        if settings.LINEAGE_REQUIRE_AUTHORITATIVE_EDGES: edge_qs=edge_qs.filter(authoritative=True)
        if direction=="downstream": edge_qs=edge_qs.filter(upstream_id=current)
        elif direction=="upstream": edge_qs=edge_qs.filter(downstream_id=current)
        else: edge_qs=edge_qs.filter(Q(upstream_id=current)|Q(downstream_id=current))
        for edge in edge_qs[:max_nodes]:
            edge_ids.add(edge.id)
            next_ids=[]
            if direction in {"downstream","both"} and edge.upstream_id==current: next_ids.append(edge.downstream_id)
            if direction in {"upstream","both"} and edge.downstream_id==current: next_ids.append(edge.upstream_id)
            for next_id in next_ids:
                if next_id not in visited and len(visited)<max_nodes:
                    visited.add(next_id); levels[next_id]=level+1; queue.append((next_id,level+1))
    assets=LineageAsset.objects.filter(owner=user,id__in=visited).select_related("product")
    edges=LineageEdge.objects.filter(owner=user,id__in=edge_ids).select_related("upstream","downstream")
    return {"root_id":root.id,"direction":direction,"depth":depth,"nodes":[{"id":x.id,"external_id":x.external_id,"name":x.name,"kind":x.kind,"system":x.system_name,"environment":x.environment,"product_id":x.product_id,"steward_name":x.steward_name,"authoritative":x.authoritative,"level":levels.get(x.id)} for x in assets],"edges":[{"id":x.id,"upstream_id":x.upstream_id,"upstream":x.upstream.name,"downstream_id":x.downstream_id,"downstream":x.downstream.name,"relation":x.relation,"authoritative":x.authoritative,"confidence":x.confidence,"source_system":x.source_system,"source_reference":x.source_reference,"evidence":x.evidence} for x in edges]}

def impact_analysis(user,asset_id,change_type="schema",depth=6):
    if not settings.LINEAGE_CHANGE_ANALYSIS_ENABLED: raise LineageError("Change analysis is disabled")
    graph=neighborhood(user,asset_id,"downstream",depth)
    root=next(x for x in graph["nodes"] if x["id"]==graph["root_id"])
    impacted=[x for x in graph["nodes"] if x["id"]!=graph["root_id"]]
    by_kind={}
    for item in impacted: by_kind.setdefault(item["kind"],[]).append(item)
    contacts=[]; seen=set()
    asset_ids=[x["id"] for x in impacted]
    for asset in LineageAsset.objects.filter(owner=user,id__in=asset_ids).prefetch_related("notification_targets"):
        for target in asset.notification_targets.filter(active=True,authoritative=True):
            key=(target.label,target.email)
            if key not in seen: contacts.append({"asset_id":asset.id,"asset_name":asset.name,"label":target.label,"contact_type":target.contact_type,"email":target.email}); seen.add(key)
        if asset.steward_name and (asset.steward_name,"") not in seen: contacts.append({"asset_id":asset.id,"asset_name":asset.name,"label":asset.steward_name,"contact_type":"steward","email":""}); seen.add((asset.steward_name,""))
    return {"source_asset":root,"change_type":change_type,"impact_count":len(impacted),"impacted_assets":impacted,"impacted_by_kind":by_kind,"edges":graph["edges"],"notification_targets":contacts,"limitations":"Impact is limited to configured, active, authoritative lineage edges within the requested depth."}

def save_scenario(user,asset_id,change_type,title,description):
    asset=LineageAsset.objects.filter(owner=user,pk=asset_id).first()
    if not asset: raise LineageError("Lineage asset not found")
    analysis=impact_analysis(user,asset.id,change_type)
    return LineageChangeScenario.objects.create(owner=user,asset=asset,change_type=change_type,title=title,description=description,analysis=analysis)
