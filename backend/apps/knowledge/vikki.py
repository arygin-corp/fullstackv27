import json
from django.conf import settings
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .access import check_readiness
from .governance import assess_product
from .marketplace import product_payload, recommend_products
from .models import MarketplaceActivity, MarketplaceFavorite, MarketplaceProduct, VikkiSession, VikkiSuggestion

VIKKI_PROMPT = """You are VIKKI, the embedded Data Marketplace assistant. Answer only about the Data Marketplace application, its configured products, domains, data types, stewardship, governance, and access guidance. Use only the supplied authoritative catalog and tool context. Never invent products, owners, approvals, access status, governance policies, fields, or capabilities. Product recommendations must name only supplied product records. Governance and access results are guidance from configured records, not approval. If the question is outside Data Marketplace, say that VIKKI is dedicated to Data Marketplace information."""

def record_activity(user, kind, product=None, query="", metadata=None):
    return MarketplaceActivity.objects.create(user=user,kind=kind,product=product,query=query,metadata=metadata or {})

def get_session(user, conversation=None, current_product=None, page_context=None):
    if conversation:
        session,_=VikkiSession.objects.get_or_create(user=user,conversation=conversation)
    else:
        session=VikkiSession.objects.filter(user=user,conversation__isnull=True).order_by("-updated_at").first() or VikkiSession.objects.create(user=user)
    changed=[]
    if current_product is not None: session.current_product=current_product; changed.append("current_product")
    if page_context is not None: session.page_context=page_context; changed.append("page_context")
    if changed: session.save(update_fields=[*changed,"updated_at"])
    return session

def marketplace_context(user, session=None):
    recent_ids=list(MarketplaceActivity.objects.filter(user=user,product__isnull=False).values_list("product_id",flat=True).distinct()[:settings.VIKKI_CONTEXT_RECENT_PRODUCTS])
    recent=list(MarketplaceProduct.objects.filter(owner=user,id__in=recent_ids).select_related("domain","data_type"))
    favorites=list(MarketplaceFavorite.objects.filter(user=user).select_related("product","product__domain","product__data_type")[:settings.VIKKI_CONTEXT_RECENT_PRODUCTS])
    cart=[]
    if hasattr(user,"access_cart"):
        cart=list(user.access_cart.items.select_related("product","product__domain","product__data_type")[:settings.VIKKI_CONTEXT_RECENT_PRODUCTS])
    requests=list(user.access_requests.select_related("product")[:settings.VIKKI_CONTEXT_RECENT_PRODUCTS])
    current=product_payload(session.current_product) if session and session.current_product else None
    return {"current_product":current,"recent_products":[product_payload(x) for x in recent],"favorites":[product_payload(x.product) for x in favorites],"cart":[product_payload(x.product) for x in cart],"recent_access_requests":[{"id":x.id,"product_id":x.product_id,"product_name":x.product.name,"status":x.status} for x in requests],"page_context":session.page_context if session else {}}

def proactive_suggestions(user, session=None):
    saved=list(VikkiSuggestion.objects.filter(user=user,active=True).select_related("product")[:settings.VIKKI_SUGGESTION_LIMIT])
    if saved: return [{"title":x.title,"prompt":x.prompt,"reason":x.reason,"product_id":x.product_id} for x in saved]
    context=marketplace_context(user,session); suggestions=[]
    if context["current_product"]:
        name=context["current_product"]["name"]; pid=context["current_product"]["id"]
        suggestions += [{"title":"Explain this product","prompt":f"Explain the Data Marketplace product {name} and its intended use.","reason":"Current product","product_id":pid},{"title":"Check governance","prompt":f"What configured governance requirements apply to product ID {pid}?","reason":"Current product","product_id":pid},{"title":"Check access readiness","prompt":f"What would I need before requesting access to product ID {pid}?","reason":"Current product","product_id":pid}]
    if context["favorites"]: suggestions.append({"title":"Compare favorites","prompt":"Compare my favorite Data Marketplace products using the configured catalog metadata.","reason":"Favorite products","product_id":None})
    if context["cart"]: suggestions.append({"title":"Review my cart","prompt":"Review the readiness of the products in my Data Marketplace access cart.","reason":"Access cart","product_id":None})
    if not suggestions: suggestions=[{"title":"Find a product","prompt":"Help me find a Data Marketplace product for my business need.","reason":"Getting started","product_id":None},{"title":"Browse domains","prompt":"What Data Marketplace domains are available in the configured catalog?","reason":"Getting started","product_id":None}]
    return suggestions[:settings.VIKKI_SUGGESTION_LIMIT]

def answer_vikki(user, question, session=None):
    if not settings.VIKKI_ENABLED: raise ValueError("VIKKI is disabled")
    question=question.strip(); session=session or get_session(user)
    context=marketplace_context(user,session); recommendations=[]; governance=None; access=None
    if settings.VIKKI_ALLOW_PRODUCT_RECOMMENDATIONS:
        recommendations=recommend_products(user,question,limit=min(settings.MARKETPLACE_RECOMMENDATION_LIMIT,6))
    current=session.current_product
    lowered=question.casefold()
    if current and settings.VIKKI_ALLOW_GOVERNANCE_GUIDANCE and any(x in lowered for x in ["governance","policy","restricted","pi","steward"]): governance=assess_product(current,persist=False)
    if current and settings.VIKKI_ALLOW_ACCESS_GUIDANCE and any(x in lowered for x in ["access","request","approval","training","ready"]): access=check_readiness(user,current,"","")
    tool_context={"marketplace_context":context,"recommendations":[{"product":product_payload(x["product"]),"score":x["score"],"reason":x["reason"]} for x in recommendations],"governance":governance,"access_readiness":access}
    result=get_chat_provider().complete([ChatMessage("system",VIKKI_PROMPT),ChatMessage("user",f"Question:\n{question}\n\nConfigured Data Marketplace context:\n{json.dumps(tool_context,ensure_ascii=False)[:settings.MARKETPLACE_PRODUCT_CONTEXT_MAX_CHARS]}")]).strip()
    record_activity(user,MarketplaceActivity.Kind.VIKKI,product=current,query=question,metadata={"recommendation_ids":[x["product"].id for x in recommendations]})
    return {"answer":result,"recommendations":[{"product":product_payload(x["product"]),"score":x["score"],"reason":x["reason"]} for x in recommendations],"governance":governance,"access_readiness":access,"suggestions":proactive_suggestions(user,session)}
