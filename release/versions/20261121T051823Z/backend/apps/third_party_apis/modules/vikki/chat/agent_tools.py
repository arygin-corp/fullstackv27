import ast
import math
import operator
from dataclasses import asdict
from django.conf import settings
from knowledge.models import Document
from knowledge.graph import graph_neighborhood, timeline_for_user
from knowledge.marketplace import compare_products, product_payload, recommend_products
from knowledge.governance import assess_product, governance_search
from knowledge.access import check_readiness
from knowledge.vikki import marketplace_context, proactive_suggestions
from knowledge.analytics import dashboard, period, search_gaps
from knowledge.lineage import asset_search, impact_analysis, neighborhood
from knowledge.retrieval import retrieve_chunks
from knowledge.search import search_documents, search_entities

class ToolError(ValueError):
    pass

_BINARY = {ast.Add:operator.add, ast.Sub:operator.sub, ast.Mult:operator.mul, ast.Div:operator.truediv, ast.FloorDiv:operator.floordiv, ast.Mod:operator.mod, ast.Pow:operator.pow}
_UNARY = {ast.UAdd:operator.pos, ast.USub:operator.neg}

def _eval(node):
    if isinstance(node, ast.Expression): return _eval(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value,(int,float)): return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _BINARY:
        left,right=_eval(node.left),_eval(node.right)
        if type(node.op) is ast.Pow and abs(right)>20: raise ToolError("Exponent is too large")
        value=_BINARY[type(node.op)](left,right)
        if not math.isfinite(float(value)) or abs(float(value))>1e100: raise ToolError("Result is outside allowed bounds")
        return value
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY: return _UNARY[type(node.op)](_eval(node.operand))
    raise ToolError("Only basic numeric arithmetic is allowed")

def calculator(user, expression):
    if not settings.AGENT_ALLOW_CALCULATOR: raise ToolError("Calculator tool is disabled")
    if len(expression)>300: raise ToolError("Expression is too long")
    return {"expression":expression,"result":_eval(ast.parse(expression,mode="eval"))}

def document_search(user, query, limit=5):
    if not settings.AGENT_ALLOW_DOCUMENT_SEARCH: raise ToolError("Document search tool is disabled")
    limit=min(max(int(limit),1),settings.AGENT_MAX_TOOL_RESULTS)
    rows=retrieve_chunks(query,user,limit)
    return {"query":query,"results":[{"chunk_id":r.chunk_id,"document_id":r.document_id,"document_title":r.document_title,"position":r.position,"content":r.content[:2000],"fusion_score":r.fusion_score,"rerank_score":r.rerank_score} for r in rows]}

def entity_search(user, query="", entity_type="", limit=8):
    if not settings.AGENT_ALLOW_ENTITY_SEARCH: raise ToolError("Entity search tool is disabled")
    limit=min(max(int(limit),1),settings.AGENT_MAX_TOOL_RESULTS)
    rows=search_entities(user,query,entity_type)[:limit]
    return {"query":query,"entity_type":entity_type,"results":[{"id":e.id,"type":e.entity_type,"name":e.canonical_name,"description":e.description,"document_count":e.document_count} for e in rows]}

def document_overview(user, document_id):
    if not settings.AGENT_ALLOW_DOCUMENT_SEARCH: raise ToolError("Document tools are disabled")
    d=Document.objects.prefetch_related("entity_links__entity").filter(owner=user,pk=int(document_id)).first()
    if not d: raise ToolError("Document not found")
    return {"document_id":d.id,"title":d.title,"executive_summary":d.executive_summary,"key_topics":d.key_topics,"key_risks":d.key_risks,"key_actions":d.key_actions,"suggested_questions":d.suggested_questions,"entities":[{"type":x.entity.entity_type,"name":x.entity.canonical_name} for x in d.entity_links.all()]}

def compare_documents(user, document_ids):
    if not settings.AGENT_ALLOW_DOCUMENT_COMPARE: raise ToolError("Document comparison tool is disabled")
    ids=list(dict.fromkeys(int(x) for x in document_ids))[:settings.AGENT_MAX_TOOL_RESULTS]
    docs=Document.objects.filter(owner=user,id__in=ids)
    found={d.id:d for d in docs}
    if len(found)!=len(ids): raise ToolError("One or more documents were not found")
    return {"documents":[{"document_id":found[i].id,"title":found[i].title,"summary":found[i].executive_summary,"topics":found[i].key_topics,"risks":found[i].key_risks,"actions":found[i].key_actions} for i in ids]}

def graph_search(user, query="", entity_id=None, hops=2):
    return graph_neighborhood(user,query=query,entity_id=entity_id,hops=hops,max_nodes=settings.KNOWLEDGE_GRAPH_MAX_NODES)

def timeline_search(user, query="", event_type="", start=None, end=None, limit=20):
    limit=min(max(int(limit),1),settings.AGENT_MAX_TOOL_RESULTS*5)
    rows=timeline_for_user(user,query,event_type,start,end)[:limit]
    return {"results":[{"id":event.id,"date":event.event_date.isoformat() if event.event_date else None,"date_text":event.date_text,"title":event.title,"description":event.description,"event_type":event.event_type,"document_id":event.document_id,"document_title":event.document.title,"evidence":event.evidence,"entities":[e.canonical_name for e in event.entities.all()]} for event in rows]}

def marketplace_recommend(user, need, limit=5):
    output=recommend_products(user,need,limit)
    return {"need":need,"recommendations":[{"product":product_payload(x["product"]),"score":x["score"],"reason":x["reason"]} for x in output]}

def marketplace_compare(user, product_ids):
    return {"products":compare_products(user,product_ids)}

def governance_assess(user, product_id):
    product=Document.objects.none()
    from knowledge.models import MarketplaceProduct
    product=MarketplaceProduct.objects.select_related("domain","data_type","fulfillment_team").filter(owner=user,pk=int(product_id)).first()
    if not product: raise ToolError("Product not found")
    return assess_product(product,persist=False)

def steward_search(user, query="", role="", domain="", limit=8):
    rows=governance_search(user,query,role,domain)[:min(int(limit),settings.AGENT_MAX_TOOL_RESULTS)]
    return {"results":[{"id":x.id,"name":x.display_name,"email":x.email,"role":x.role,"domain":x.domain.name if x.domain else None,"team":x.team.name if x.team else None,"product_count":x.product_count} for x in rows]}

def access_readiness(user, product_id, business_justification="", intended_use=""):
    from knowledge.models import MarketplaceProduct
    product=MarketplaceProduct.objects.select_related("domain","data_type").filter(owner=user,pk=int(product_id)).first()
    if not product: raise ToolError("Product not found")
    return check_readiness(user,product,business_justification,intended_use)

def vikki_context(user):
    return {"context":marketplace_context(user),"suggestions":proactive_suggestions(user)}

def marketplace_analytics(user, days=30):
    return dashboard(user, days)

def marketplace_search_gaps(user, days=30, minimum=2):
    start,end=period(days)
    return {"period":{"start":start.isoformat(),"end":end.isoformat()},"gaps":search_gaps(user,start,end,minimum)}

def lineage_search(user, query="", kind="", limit=20):
    rows=asset_search(user,query,kind,limit)
    return {"results":[{"id":x.id,"external_id":x.external_id,"name":x.name,"kind":x.kind,"system":x.system_name,"environment":x.environment,"product_id":x.product_id,"authoritative":x.authoritative} for x in rows]}

def lineage_graph(user, asset_id, direction="both", depth=3):
    return neighborhood(user,asset_id,direction,depth)

def lineage_impact(user, asset_id, change_type="schema", depth=6):
    return impact_analysis(user,asset_id,change_type,depth)

TOOLS={
    "calculator": calculator,
    "document_search": document_search,
    "entity_search": entity_search,
    "document_overview": document_overview,
    "compare_documents": compare_documents,
    "graph_search": graph_search,
    "timeline_search": timeline_search,
    "marketplace_recommend": marketplace_recommend,
    "marketplace_compare": marketplace_compare,
    "governance_assess": governance_assess,
    "steward_search": steward_search,
    "access_readiness": access_readiness,
    "vikki_context": vikki_context,
    "marketplace_analytics": marketplace_analytics,
    "marketplace_search_gaps": marketplace_search_gaps,
    "lineage_search": lineage_search,
    "lineage_graph": lineage_graph,
    "lineage_impact": lineage_impact,
}
TOOL_DESCRIPTIONS={
    "calculator":{"description":"Evaluate basic numeric arithmetic only.","arguments":{"expression":"string"}},
    "document_search":{"description":"Retrieve grounded chunks from the authenticated user's documents.","arguments":{"query":"string","limit":"integer optional"}},
    "entity_search":{"description":"Search the authenticated user's extracted entities.","arguments":{"query":"string optional","entity_type":"string optional","limit":"integer optional"}},
    "document_overview":{"description":"Read stored intelligence for one owned document.","arguments":{"document_id":"integer"}},
    "compare_documents":{"description":"Load stored summaries, topics, risks, and actions for owned documents.","arguments":{"document_ids":"integer array"}},
    "graph_search":{"description":"Traverse relationships between owned knowledge entities.","arguments":{"query":"string optional","entity_id":"integer optional","hops":"integer optional"}},
    "timeline_search":{"description":"Search grounded timeline events from owned documents.","arguments":{"query":"string optional","event_type":"string optional","start":"YYYY-MM-DD optional","end":"YYYY-MM-DD optional","limit":"integer optional"}},
    "marketplace_recommend":{"description":"Recommend Data Marketplace products for a stated user need.","arguments":{"need":"string","limit":"integer optional"}},
    "marketplace_compare":{"description":"Compare owned Data Marketplace product records.","arguments":{"product_ids":"integer array"}},
    "governance_assess":{"description":"Evaluate one owned product against configured authoritative governance rules.","arguments":{"product_id":"integer"}},
    "steward_search":{"description":"Search configured Data Marketplace stewards and owners.","arguments":{"query":"string optional","role":"string optional","domain":"string optional","limit":"integer optional"}},
    "access_readiness":{"description":"Check an owned product request against configured access requirements, governance rules, requester profile, and approval route. Read-only.","arguments":{"product_id":"integer","business_justification":"string optional","intended_use":"string optional"}},
    "vikki_context":{"description":"Load the authenticated user Data Marketplace context, including recent products, favorites, cart, and recent access-request status.","arguments":{}},
    "marketplace_analytics":{"description":"Return aggregated Data Marketplace adoption metrics for the authenticated user and bounded date range.","arguments":{"days":"integer optional"}},
    "marketplace_search_gaps":{"description":"Return recurring zero-result Data Marketplace search queries for the authenticated user.","arguments":{"days":"integer optional","minimum":"integer optional"}},
    "lineage_search":{"description":"Search configured authoritative lineage assets.","arguments":{"query":"string optional","kind":"string optional","limit":"integer optional"}},
    "lineage_graph":{"description":"Traverse configured upstream or downstream lineage for an owned asset.","arguments":{"asset_id":"integer","direction":"upstream|downstream|both optional","depth":"integer optional"}},
    "lineage_impact":{"description":"Run read-only downstream impact analysis for a configured asset and change type.","arguments":{"asset_id":"integer","change_type":"string optional","depth":"integer optional"}},
}

def execute_tool(name,user,arguments):
    tool=TOOLS.get(name)
    if not tool: raise ToolError(f"Unknown or unapproved tool: {name}")
    if not isinstance(arguments,dict): raise ToolError("Tool arguments must be an object")
    try: return tool(user=user,**arguments)
    except TypeError as exc: raise ToolError(f"Invalid arguments for {name}") from exc
