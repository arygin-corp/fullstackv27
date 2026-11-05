import json
import re
from difflib import SequenceMatcher
from django.conf import settings
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db.models import Q
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .models import MarketplaceProduct, MarketplaceProductSimilarity

ENRICH_PROMPT = """Analyze this Data Marketplace product metadata. Return only JSON with keys summary, use_cases, audiences, keywords. Do not invent capabilities, fields, access rights, owners, or availability. Use cases and audiences must be reasonable only when directly supported by the supplied metadata. Return empty arrays when unsupported."""
RECOMMEND_PROMPT = """Rank only the supplied Data Marketplace products for the user's stated need. Return only JSON with shape {"recommendations":[{"id":1,"score":0.0,"reason":"grounded reason"}]}. Scores must be between 0 and 1. Do not invent products or product capabilities."""

def _json_object(text):
    try: value=json.loads(text)
    except json.JSONDecodeError:
        match=re.search(r"\{[\s\S]*\}",text)
        if not match: raise ValueError("Model did not return JSON")
        value=json.loads(match.group(0))
    if not isinstance(value,dict): raise ValueError("Expected a JSON object")
    return value

def product_payload(product):
    return {"id":product.id,"external_id":product.external_id,"sku":product.sku,"name":product.name,"description":product.brief_description or product.short_description,"intended_use":product.intended_use,"domain":product.domain.name if product.domain else None,"data_type":product.data_type.name if product.data_type else None,"fulfillment_team":product.fulfillment_team.name if product.fulfillment_team else None,"steward_name":product.steward_name,"status":product.status,"active":product.active,"contains_pi":product.contains_pi,"contains_sensitive_pi":product.contains_sensitive_pi,"data_review_required":product.data_review_required,"access_type":product.access_type,"environment":product.environment,"availability":product.availability,"frequency":product.frequency,"ai_summary":product.ai_summary,"ai_use_cases":product.ai_use_cases,"ai_audiences":product.ai_audiences,"ai_keywords":product.ai_keywords,"resource_url":product.resource_url}

def enrich_product(product):
    if not settings.MARKETPLACE_INTELLIGENCE_ENABLED:
        product.intelligence_status="disabled"; product.save(update_fields=["intelligence_status"]); return product
    source=product_payload(product)
    try:
        raw=get_chat_provider().complete([ChatMessage("system",ENRICH_PROMPT),ChatMessage("user",json.dumps(source,ensure_ascii=False))])
        data=_json_object(raw)
        def clean(value,limit): return list(dict.fromkeys(str(x).strip() for x in value if str(x).strip()))[:limit] if isinstance(value,list) else []
        product.ai_summary=str(data.get("summary","")).strip()
        product.ai_use_cases=clean(data.get("use_cases",[]),12)
        product.ai_audiences=clean(data.get("audiences",[]),12)
        product.ai_keywords=clean(data.get("keywords",[]),30)
        product.intelligence_status="complete"; product.intelligence_error=""
    except Exception as exc:
        product.intelligence_status="failed"; product.intelligence_error=str(exc)[:2000]
    product.save(update_fields=["ai_summary","ai_use_cases","ai_audiences","ai_keywords","intelligence_status","intelligence_error","updated_at"])
    return product

def lexical_products(user,query,limit=30,filters=None):
    filters=filters or {}; qs=MarketplaceProduct.objects.filter(owner=user,active=True).select_related("domain","data_type","fulfillment_team")
    if filters.get("domain"): qs=qs.filter(domain__name__iexact=filters["domain"])
    if filters.get("data_type"): qs=qs.filter(data_type__name__iexact=filters["data_type"])
    if filters.get("status"): qs=qs.filter(status=filters["status"])
    if query:
        search_query=SearchQuery(query,search_type="websearch")
        vector=(SearchVector("name",weight="A")+SearchVector("brief_description",weight="A")+SearchVector("short_description",weight="B")+SearchVector("intended_use",weight="A")+SearchVector("ai_summary",weight="B"))
        qs=qs.annotate(rank=SearchRank(vector,search_query)).filter(Q(rank__gt=0)|Q(name__icontains=query)|Q(sku__icontains=query)|Q(ai_keywords__icontains=query)).order_by("-rank","name")
    return list(qs[:limit])

def recommend_products(user,need,limit=None,filters=None):
    limit=min(limit or settings.MARKETPLACE_RECOMMENDATION_LIMIT,20)
    candidates=lexical_products(user,need,max(limit*4,20),filters)
    if not candidates:
        candidates=list(MarketplaceProduct.objects.filter(owner=user,active=True).select_related("domain","data_type","fulfillment_team")[:max(limit*4,20)])
    payload=[product_payload(p) for p in candidates]
    try:
        raw=get_chat_provider().complete([ChatMessage("system",RECOMMEND_PROMPT),ChatMessage("user",f"User need: {need}\nProducts: {json.dumps(payload,ensure_ascii=False)[:settings.MARKETPLACE_PRODUCT_CONTEXT_MAX_CHARS]}")])
        ranked=_json_object(raw).get("recommendations",[])
    except Exception:
        ranked=[]
    mapping={p.id:p for p in candidates}; output=[]; seen=set()
    for item in ranked:
        if not isinstance(item,dict): continue
        try: pid=int(item.get("id")); score=max(0.0,min(float(item.get("score",0)),1.0))
        except (TypeError,ValueError): continue
        if pid in mapping and pid not in seen:
            output.append({"product":mapping[pid],"score":score,"reason":str(item.get("reason","")).strip()}); seen.add(pid)
    for product in candidates:
        if len(output)>=limit: break
        if product.id not in seen:
            text=" ".join([product.name,product.brief_description,product.intended_use,product.ai_summary,*product.ai_keywords]).casefold()
            score=SequenceMatcher(None,need.casefold(),text[:2000]).ratio()
            output.append({"product":product,"score":score,"reason":"Matched catalog metadata."}); seen.add(product.id)
    return sorted(output,key=lambda x:x["score"],reverse=True)[:limit]

def compare_products(user,ids):
    ids=list(dict.fromkeys(int(x) for x in ids))[:settings.MARKETPLACE_COMPARISON_LIMIT]
    products=MarketplaceProduct.objects.filter(owner=user,id__in=ids).select_related("domain","data_type","fulfillment_team")
    mapping={p.id:p for p in products}
    if len(mapping)!=len(ids): raise ValueError("One or more products were not found")
    return [product_payload(mapping[i]) for i in ids]

def rebuild_similarities(user,threshold=0.25):
    products=list(MarketplaceProduct.objects.filter(owner=user,active=True).select_related("domain","data_type"))
    MarketplaceProductSimilarity.objects.filter(owner=user).delete(); rows=[]
    for source in products:
        a=" ".join([source.name,source.brief_description,source.intended_use,*source.ai_keywords]).casefold()
        scored=[]
        for target in products:
            if source.id==target.id: continue
            b=" ".join([target.name,target.brief_description,target.intended_use,*target.ai_keywords]).casefold()
            score=SequenceMatcher(None,a[:3000],b[:3000]).ratio()
            if source.domain_id and source.domain_id==target.domain_id: score=min(1.0,score+0.15)
            if source.data_type_id and source.data_type_id==target.data_type_id: score=min(1.0,score+0.10)
            if score>=threshold: scored.append((target,score))
        for target,score in sorted(scored,key=lambda x:x[1],reverse=True)[:10]:
            rows.append(MarketplaceProductSimilarity(owner=user,source=source,target=target,score=score,rationale="Catalog metadata, domain, and data-type similarity."))
    MarketplaceProductSimilarity.objects.bulk_create(rows)
    return len(rows)
