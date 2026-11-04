import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.knowledge.forms import DocumentUploadForm
from apps.knowledge.models import Document
from apps.knowledge.services import ingest_document
from .models import Conversation, Message
from .serializers import ChatRequestSerializer
from .services import prepare_answer
from .authentication import (EntraAccessTokenAuthentication)

@login_required
def index(request, conversation_id=None):
    conversations = request.user.conversations.all()
    active = None
    if conversation_id:
        active = get_object_or_404(conversations, pk=conversation_id)
    return render(request, "chat/index.html", {
        "documents": request.user.knowledge_documents.all(),
        "conversations": conversations,
        "active_conversation": active,
        "messages": active.messages.all() if active else [],
        "form": DocumentUploadForm(),
    })

@login_required
@require_POST
def upload_document(request):
    form = DocumentUploadForm(request.POST, request.FILES)
    if not form.is_valid():
        return render(request, "chat/index.html", {"documents": request.user.knowledge_documents.all(), "conversations": request.user.conversations.all(), "messages": [], "active_conversation": None, "form": form}, status=400)
    document = form.save(commit=False)
    document.owner = request.user
    document.save()
    try:
        ingest_document(document)
    except Exception as exc:
        document.source_file.delete(save=False)
        document.delete()
        form.add_error(None, str(exc))
        return render(request, "chat/index.html", {"documents": request.user.knowledge_documents.all(), "conversations": request.user.conversations.all(), "messages": [], "active_conversation": None, "form": form}, status=400)
    return redirect("home")

@login_required
@require_POST
def delete_document(request, document_id):
    document = get_object_or_404(request.user.knowledge_documents, pk=document_id)
    document.source_file.delete(save=False)
    document.delete()
    return redirect("home")

@login_required
@require_POST
def delete_conversation(request, conversation_id):
    conversation = get_object_or_404(request.user.conversations, pk=conversation_id)
    conversation.delete()
    return redirect("home")

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = [{"id": c.id, "title": c.title, "created_at": c.created_at, "updated_at": c.updated_at} for c in request.user.conversations.all()]
        return Response(data)

class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, conversation_id):
        c = get_object_or_404(request.user.conversations, pk=conversation_id)
        return Response({"id": c.id, "title": c.title, "messages": [{"id": m.id, "role": m.role, "content": m.content, "citations": m.citations, "created_at": m.created_at} for m in c.messages.all()]})

class ChatView(APIView):
    authentication_classes = [EntraAccessTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        q = serializer.validated_data["question"]
        cid = serializer.validated_data.get("conversation_id")
        conversation = get_object_or_404(request.user.conversations, pk=cid) if cid else Conversation.objects.create(user=request.user, title=q[:100])
        history = list(conversation.messages.all())
        user_message=Message.objects.create(conversation=conversation, role=Message.Role.USER, content=q)
        provider, messages, citations = prepare_answer(q, request.user, conversation, history)
        answer = provider.complete(messages)
        Message.objects.create(conversation=conversation, role=Message.Role.ASSISTANT, content=answer, citations=citations)
        from .memory import extract_memories, summarize_conversation
        extract_memories(request.user, conversation, user_message)
        summarize_conversation(conversation)
        conversation.save(update_fields=["updated_at"])
        return Response({"conversation_id": conversation.id, "answer": answer, "citations": citations})

class StreamingChatView(APIView):
    authentication_classes = [EntraAccessTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        q = serializer.validated_data["question"]
        cid = serializer.validated_data.get("conversation_id")
        conversation = get_object_or_404(request.user.conversations, pk=cid) if cid else Conversation.objects.create(user=request.user, title=q[:100])
        history = list(conversation.messages.all())
        user_message=Message.objects.create(conversation=conversation, role=Message.Role.USER, content=q)
        provider, messages, citations = prepare_answer(q, request.user, conversation, history)
        def events():
            pieces = []
            try:
                yield f"data: {json.dumps({'type':'conversation','conversation_id':conversation.id,'title':conversation.title})}\n\n"
                yield f"data: {json.dumps({'type':'sources','sources':citations})}\n\n"
                for token in provider.stream(messages):
                    pieces.append(token)
                    yield f"data: {json.dumps({'type':'token','token':token})}\n\n"
                Message.objects.create(conversation=conversation, role=Message.Role.ASSISTANT, content="".join(pieces), citations=citations)
                from .memory import extract_memories, summarize_conversation
                extract_memories(request.user, conversation, user_message)
                summarize_conversation(conversation)
                conversation.save(update_fields=["updated_at"])
                yield f"data: {json.dumps({'type':'done','conversation_id':conversation.id})}\n\n"
            except Exception as exc:
                yield f"data: {json.dumps({'type':'error','message':str(exc)})}\n\n"
        return StreamingHttpResponse(events(), content_type="text/event-stream", headers={"Cache-Control":"no-cache", "X-Accel-Buffering":"no"})

@login_required
def document_detail(request, document_id):
    document = get_object_or_404(request.user.knowledge_documents.prefetch_related("entity_links__entity"), pk=document_id)
    return render(request, "knowledge/document_detail.html", {"document": document})

class EntitySearchView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from knowledge.search import search_entities
        query=request.query_params.get("q", "").strip(); entity_type=request.query_params.get("type", "").strip()
        entities=search_entities(request.user, query, entity_type)[:100]
        return Response([{"id":e.id,"type":e.entity_type,"name":e.canonical_name,"description":e.description,"document_count":e.document_count} for e in entities])

class DocumentSearchView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from knowledge.search import search_documents
        query=request.query_params.get("q", "").strip(); entity_type=request.query_params.get("type", "").strip()
        documents=search_documents(request.user, query, entity_type)[:100]
        return Response([{"id":d.id,"title":d.title,"summary":d.executive_summary,"topics":d.key_topics,"intelligence_status":d.intelligence_status,"entities":[{"type":link.entity.entity_type,"name":link.entity.canonical_name} for link in d.entity_links.all()]} for d in documents])

@login_required
def memory_settings(request):
    from .forms import MemoryItemForm, MemoryProfileForm
    from .memory import normalize_memory, profile_for
    from .models import MemoryItem
    profile=profile_for(request.user)
    if request.method=="POST" and request.POST.get("form_type")=="profile":
        profile_form=MemoryProfileForm(request.POST,instance=profile)
        if profile_form.is_valid(): profile_form.save(); return redirect("memory-settings")
    else: profile_form=MemoryProfileForm(instance=profile)
    if request.method=="POST" and request.POST.get("form_type")=="item":
        item_form=MemoryItemForm(request.POST)
        if item_form.is_valid():
            item=item_form.save(commit=False); item.user=request.user; item.normalized_content=normalize_memory(item.content); item.source=MemoryItem.Source.USER; item.confirmed=True
            try: item.save()
            except Exception: item_form.add_error("content","This memory already exists.")
            else: return redirect("memory-settings")
    else: item_form=MemoryItemForm()
    return render(request,"chat/memory_settings.html",{"profile_form":profile_form,"item_form":item_form,"memories":request.user.memory_items.all()})

@login_required
@require_POST
def delete_memory(request,memory_id):
    memory=get_object_or_404(request.user.memory_items,pk=memory_id); memory.delete(); return redirect("memory-settings")

class MemoryListCreateView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from .memory import profile_for
        p=profile_for(request.user)
        return Response({"enabled":p.enabled,"custom_instructions":p.custom_instructions,"items":[{"id":m.id,"kind":m.kind,"content":m.content,"source":m.source,"active":m.active,"confirmed":m.confirmed} for m in request.user.memory_items.all()]})
    def post(self,request):
        from .memory import normalize_memory
        from .models import MemoryItem
        kind=str(request.data.get("kind","")).strip(); content=str(request.data.get("content","")).strip()
        if kind not in {x for x,_ in MemoryItem.Kind.choices} or not content: return Response({"detail":"Valid kind and content are required."},status=400)
        item,created=MemoryItem.objects.get_or_create(user=request.user,kind=kind,normalized_content=normalize_memory(content),defaults={"content":content,"source":MemoryItem.Source.USER,"confirmed":True})
        return Response({"id":item.id,"created":created,"kind":item.kind,"content":item.content},status=201 if created else 200)

class MemoryDeleteView(APIView):
    permission_classes=[IsAuthenticated]
    def delete(self,request,memory_id):
        get_object_or_404(request.user.memory_items,pk=memory_id).delete(); return Response(status=204)

class AgentRunView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from .agent import run_agent
        objective=str(request.data.get("objective","")).strip(); mode=str(request.data.get("mode","assistant")).strip(); cid=request.data.get("conversation_id")
        if not objective: return Response({"detail":"objective is required"},status=400)
        conversation=get_object_or_404(request.user.conversations,pk=cid) if cid else None
        run=run_agent(request.user,objective,mode,conversation)
        return Response({"id":run.id,"status":run.status,"mode":run.mode,"objective":run.objective,"plan":run.plan,"answer":run.final_answer,"citations":run.citations,"error":run.error,"steps":[{"position":s.position,"title":s.title,"tool":s.tool_name,"status":s.status,"input":s.tool_input,"output":s.tool_output,"error":s.error} for s in run.steps.all()]},status=200 if run.status==run.Status.COMPLETED else 422)

class AgentRunDetailView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,run_id):
        from .models import AgentRun
        run=get_object_or_404(AgentRun.objects.prefetch_related("steps"),user=request.user,pk=run_id)
        return Response({"id":run.id,"status":run.status,"mode":run.mode,"objective":run.objective,"plan":run.plan,"answer":run.final_answer,"citations":run.citations,"error":run.error,"steps":[{"position":s.position,"title":s.title,"tool":s.tool_name,"status":s.status,"input":s.tool_input,"output":s.tool_output,"error":s.error} for s in run.steps.all()]})

@login_required
def agent_workspace(request):
    from .models import AgentRun
    return render(request,"chat/agent_workspace.html",{"runs":AgentRun.objects.filter(user=request.user)[:20]})

@login_required
def graph_workspace(request):
    from knowledge.graph import graph_neighborhood
    query=request.GET.get("q","").strip(); graph=graph_neighborhood(request.user,query=query)
    return render(request,"knowledge/graph.html",{"graph":graph,"query":query})

@login_required
def timeline_workspace(request):
    from knowledge.graph import timeline_for_user
    query=request.GET.get("q","").strip(); event_type=request.GET.get("type","").strip(); events=timeline_for_user(request.user,query,event_type)[:200]
    return render(request,"knowledge/timeline.html",{"events":events,"query":query,"event_type":event_type})

class GraphView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from knowledge.graph import graph_neighborhood
        return Response(graph_neighborhood(request.user,query=request.query_params.get("q","").strip(),entity_id=request.query_params.get("entity_id"),hops=request.query_params.get("hops"),max_nodes=request.query_params.get("max_nodes")))

class TimelineView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from knowledge.graph import timeline_for_user
        rows=timeline_for_user(request.user,request.query_params.get("q","").strip(),request.query_params.get("type","").strip(),request.query_params.get("start"),request.query_params.get("end"))[:200]
        return Response([{"id":e.id,"date":e.event_date,"date_text":e.date_text,"title":e.title,"description":e.description,"event_type":e.event_type,"document_id":e.document_id,"document_title":e.document.title,"evidence":e.evidence,"entities":[{"id":x.id,"type":x.entity_type,"name":x.canonical_name} for x in e.entities.all()]} for e in rows])

@login_required
def marketplace_workspace(request):
    from knowledge.marketplace import lexical_products, recommend_products
    from knowledge.models import MarketplaceDomain, MarketplaceDataType
    query=request.GET.get("q","").strip(); domain=request.GET.get("domain","").strip(); dtype=request.GET.get("data_type","").strip(); recommend=request.GET.get("recommend")=="1"
    filters={"domain":domain,"data_type":dtype}
    recommendations=recommend_products(request.user,query,filters=filters) if query and recommend else []
    products=[] if recommendations else lexical_products(request.user,query,100,filters)
    if query:
        from knowledge.analytics import log_search
        from knowledge.models import MarketplaceActivity
        from knowledge.vikki import record_activity
        count=len(recommendations) if recommendations else len(products)
        log_search(request.user,query,count,recommend,filters)
        record_activity(request.user,MarketplaceActivity.Kind.RECOMMEND if recommend else MarketplaceActivity.Kind.SEARCH,query=query,metadata={"result_count":count,"filters":filters})
    return render(request,"knowledge/marketplace.html",{"query":query,"domain":domain,"data_type":dtype,"products":products,"recommendations":recommendations,"domains":MarketplaceDomain.objects.filter(owner=request.user,active=True),"data_types":MarketplaceDataType.objects.filter(owner=request.user,active=True)})

@login_required
def marketplace_product_detail(request,product_id):
    from apps.knowledge.models import MarketplaceProduct
    product=get_object_or_404(MarketplaceProduct.objects.select_related("domain","data_type","fulfillment_team").prefetch_related("similar_products__target"),owner=request.user,pk=product_id)
    from knowledge.models import MarketplaceActivity
    from knowledge.vikki import get_session, record_activity
    record_activity(request.user,MarketplaceActivity.Kind.VIEW,product=product)
    get_session(request.user,current_product=product,page_context={"page":"product_detail","product_id":product.id})
    return render(request,"knowledge/marketplace_product.html",{"product":product})

class MarketplaceSearchView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from knowledge.marketplace import lexical_products, product_payload
        rows=lexical_products(request.user,request.query_params.get("q","").strip(),min(int(request.query_params.get("limit",20)),100),{"domain":request.query_params.get("domain","").strip(),"data_type":request.query_params.get("data_type","").strip(),"status":request.query_params.get("status","").strip()})
        return Response([product_payload(p) for p in rows])

class MarketplaceRecommendView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from knowledge.marketplace import product_payload, recommend_products
        need=str(request.data.get("need","")).strip()
        if not need: return Response({"detail":"need is required"},status=400)
        output=recommend_products(request.user,need,request.data.get("limit"),request.data.get("filters") or {})
        from knowledge.analytics import log_search
        from knowledge.models import MarketplaceActivity
        from knowledge.vikki import record_activity
        log_search(request.user,need,len(output),True,request.data.get("filters") or {})
        record_activity(request.user,MarketplaceActivity.Kind.RECOMMEND,query=need,metadata={"result_count":len(output)})
        return Response([{"product":product_payload(x["product"]),"score":x["score"],"reason":x["reason"]} for x in output])

class MarketplaceCompareView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from knowledge.marketplace import compare_products
        try: products=compare_products(request.user,request.data.get("product_ids") or [])
        except ValueError as exc: return Response({"detail":str(exc)},status=400)
        return Response({"products":products})

@login_required
def governance_workspace(request):
    from knowledge.governance import governance_search, workload_summary
    from apps.knowledge.models import MarketplaceDomain
    query=request.GET.get("q","").strip(); role=request.GET.get("role","").strip(); domain=request.GET.get("domain","").strip()
    return render(request,"knowledge/governance.html",{"query":query,"role":role,"domain":domain,"stewards":governance_search(request.user,query,role,domain)[:100],"workload":workload_summary(request.user),"domains":MarketplaceDomain.objects.filter(owner=request.user,active=True)})

class GovernanceAssessView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from apps.knowledge.governance import assess_product
        from apps.knowledge.models import MarketplaceProduct
        product=get_object_or_404(MarketplaceProduct.objects.select_related("domain","data_type","fulfillment_team"),owner=request.user,pk=request.data.get("product_id"))
        result=assess_product(product)
        from knowledge.models import MarketplaceActivity
        from knowledge.vikki import record_activity
        record_activity(request.user,MarketplaceActivity.Kind.GOVERNANCE_CHECK,product=product,metadata={"status":result["status"]})
        return Response(result)

class GovernanceStewardSearchView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.governance import governance_search
        rows=governance_search(request.user,request.query_params.get("q","").strip(),request.query_params.get("role","").strip(),request.query_params.get("domain","").strip())[:100]
        return Response([{"id":x.id,"name":x.display_name,"email":x.email,"role":x.role,"role_label":x.get_role_display(),"domain":x.domain.name if x.domain else None,"team":x.team.name if x.team else None,"product_count":x.product_count,"capacity":x.capacity} for x in rows])

class GovernancePoliciesView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from knowledge.models import GovernancePolicy
        rows=GovernancePolicy.objects.filter(owner=request.user,active=True).prefetch_related("rules")
        return Response([{"id":p.id,"name":p.name,"version":p.version,"description":p.description,"severity":p.severity,"authoritative":p.authoritative,"effective_date":p.effective_date,"review_date":p.review_date,"source_url":p.source_url,"rules":[{"id":r.id,"name":r.name,"condition_type":r.condition_type,"condition_value":r.condition_value,"requirement_type":r.requirement_type,"requirement_value":r.requirement_value,"message":r.message} for r in p.rules.filter(active=True)]} for p in rows])

@login_required
def access_workspace(request):
    from knowledge.access import cart_for, check_readiness, profile_for
    cart=cart_for(request.user); profile=profile_for(request.user)
    items=[]
    for item in cart.items.select_related("product","product__domain","product__data_type"):
        items.append({"item":item,"readiness":check_readiness(request.user,item.product,item.business_justification,item.intended_use)})
    return render(request,"knowledge/access.html",{"items":items,"profile":profile,"requests":request.user.access_requests.select_related("product")[:50]})

class AccessReadinessView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from apps.knowledge.access import check_readiness
        from apps.knowledge.models import MarketplaceProduct
        product=get_object_or_404(MarketplaceProduct.objects.select_related("domain","data_type"),owner=request.user,pk=request.data.get("product_id"))
        result=check_readiness(request.user,product,str(request.data.get("business_justification","") or ""),str(request.data.get("intended_use","") or ""))
        from apps.knowledge.models import MarketplaceActivity
        from apps.knowledge.vikki import record_activity
        record_activity(request.user,MarketplaceActivity.Kind.ACCESS_CHECK,product=product,metadata={"ready":result["ready"]})
        return Response(result)

class AccessCartView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.access import cart_for, check_readiness
        cart=cart_for(request.user)
        return Response([{"item_id":x.id,"product_id":x.product_id,"product_name":x.product.name,"business_justification":x.business_justification,"intended_use":x.intended_use,"readiness":check_readiness(request.user,x.product,x.business_justification,x.intended_use)} for x in cart.items.select_related("product","product__domain","product__data_type")])
    def post(self,request):
        from apps.knowledge.access import AccessError, add_to_cart
        from apps.knowledge.models import MarketplaceProduct
        product=get_object_or_404(MarketplaceProduct,owner=request.user,pk=request.data.get("product_id"))
        try:item=add_to_cart(request.user,product,str(request.data.get("business_justification","") or ""),str(request.data.get("intended_use","") or ""))
        except AccessError as exc:return Response({"detail":str(exc)},status=400)
        from apps.knowledge.models import MarketplaceActivity
        from apps.knowledge.vikki import record_activity
        record_activity(request.user,MarketplaceActivity.Kind.CART,product=product)
        return Response({"item_id":item.id,"product_id":product.id,"product_name":product.name},status=201)

class AccessDraftRequestsView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from apps.knowledge.access import create_draft_requests
        rows=create_draft_requests(request.user)
        return Response([{"id":x.id,"product_id":x.product_id,"product_name":x.product.name,"status":x.status,"readiness":x.readiness_snapshot,"governance":x.governance_snapshot,"approval_route":x.route_snapshot} for x in rows],status=201)

class AccessRequestSubmitView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,request_id):
        from apps.knowledge.access import AccessError, submit_request
        from apps.knowledge.models import AccessRequest
        access_request=get_object_or_404(AccessRequest,owner=request.user,pk=request_id)
        try:submit_request(access_request)
        except AccessError as exc:return Response({"detail":str(exc)},status=400)
        return Response({"id":access_request.id,"status":access_request.status,"submitted_at":access_request.submitted_at})

@login_required
def vikki_workspace(request):
    from apps.knowledge.vikki import get_session, proactive_suggestions
    session=get_session(request.user)
    return render(request,"knowledge/vikki.html",{"suggestions":proactive_suggestions(request.user,session),"vikki_name":settings.VIKKI_NAME})

class VikkiChatView(APIView):
    authentication_classes = [EntraAccessTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        from apps.knowledge.models import MarketplaceProduct
        from apps.knowledge.vikki import answer_vikki, get_session
        question=str(request.data.get("question","")).strip()
        if not question:return Response({"detail":"question is required"},status=400)
        product_id=request.data.get("product_id"); product=None
        if product_id: product=get_object_or_404(MarketplaceProduct,owner=request.user,pk=product_id)
        conversation=None; cid=request.data.get("conversation_id")
        if cid: conversation=get_object_or_404(request.user.conversations,pk=cid)
        session=get_session(request.user,conversation,product,request.data.get("page_context") or {})
        return Response(answer_vikki(request.user,question,session))

class VikkiContextView(APIView):
    authentication_classes = [EntraAccessTokenAuthentication]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.vikki import get_session, marketplace_context, proactive_suggestions
        session=get_session(request.user)
        return Response({"context":marketplace_context(request.user,session),"suggestions":proactive_suggestions(request.user,session)})

class MarketplaceFavoriteView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,product_id):
        from apps.knowledge.models import MarketplaceActivity, MarketplaceFavorite, MarketplaceProduct
        from apps.knowledge.vikki import record_activity
        product=get_object_or_404(MarketplaceProduct,owner=request.user,pk=product_id)
        favorite,created=MarketplaceFavorite.objects.get_or_create(user=request.user,product=product)
        if created:record_activity(request.user,MarketplaceActivity.Kind.FAVORITE,product=product)
        return Response({"favorite":True,"created":created})
    def delete(self,request,product_id):
        from apps.knowledge.models import MarketplaceFavorite
        MarketplaceFavorite.objects.filter(user=request.user,product_id=product_id).delete()
        return Response(status=204)

@login_required
def analytics_workspace(request):
    from apps.knowledge.analytics import dashboard
    data=dashboard(request.user,request.GET.get("days"))
    return render(request,"knowledge/analytics.html",{"analytics":data,"days":request.GET.get("days") or settings.MARKETPLACE_ANALYTICS_DEFAULT_DAYS})

class MarketplaceAnalyticsView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.analytics import dashboard
        return Response(dashboard(request.user,request.query_params.get("days"),persist=request.query_params.get("snapshot")=="1"))

class MarketplaceSearchGapsView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.analytics import period, search_gaps
        start,end=period(request.query_params.get("days"))
        return Response({"period":{"start":start,"end":end},"gaps":search_gaps(request.user,start,end,request.query_params.get("minimum"))})

@login_required
def analytics_export(request):
    import csv
    from django.http import HttpResponse
    from apps.knowledge.analytics import period
    from apps.knowledge.models import MarketplaceActivity, MarketplaceSearchEvent
    start,end=period(request.GET.get("days")); export_type=request.GET.get("type","activity")
    response=HttpResponse(content_type="text/csv"); response["Content-Disposition"]=f'attachment; filename="marketplace_{export_type}_{start}_{end}.csv"'
    writer=csv.writer(response)
    if export_type=="searches":
        writer.writerow(["timestamp","query","normalized_query","result_count","recommendation","filters"])
        for x in MarketplaceSearchEvent.objects.filter(user=request.user,created_at__date__range=(start,end))[:settings.MARKETPLACE_ANALYTICS_EXPORT_LIMIT]: writer.writerow([x.created_at.isoformat(),x.query,x.normalized_query,x.result_count,x.recommendation,x.filters])
    else:
        writer.writerow(["timestamp","kind","product_id","product_name","query","metadata"])
        for x in MarketplaceActivity.objects.filter(user=request.user,created_at__date__range=(start,end)).select_related("product")[:settings.MARKETPLACE_ANALYTICS_EXPORT_LIMIT]: writer.writerow([x.created_at.isoformat(),x.kind,x.product_id,x.product.name if x.product else "",x.query,x.metadata])
    return response

@login_required
def lineage_workspace(request):
    from apps.knowledge.lineage import asset_search, impact_analysis, neighborhood
    query=request.GET.get("q","").strip(); kind=request.GET.get("kind","").strip(); asset_id=request.GET.get("asset_id"); direction=request.GET.get("direction","downstream"); depth=request.GET.get("depth",3)
    assets=asset_search(request.user,query,kind,100); graph=None;impact=None
    if asset_id:
        graph=neighborhood(request.user,asset_id,direction,depth)
        if request.GET.get("impact")=="1": impact=impact_analysis(request.user,asset_id,request.GET.get("change_type","schema"),depth)
    return render(request,"knowledge/lineage.html",{"query":query,"kind":kind,"assets":assets,"graph":graph,"impact":impact,"asset_id":asset_id,"direction":direction,"depth":depth})

class LineageAssetsView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        from apps.knowledge.lineage import asset_search
        rows=asset_search(request.user,request.query_params.get("q","").strip(),request.query_params.get("kind","").strip(),request.query_params.get("limit",50))
        return Response([{"id":x.id,"external_id":x.external_id,"name":x.name,"kind":x.kind,"system_name":x.system_name,"environment":x.environment,"qualified_name":x.qualified_name,"product_id":x.product_id,"authoritative":x.authoritative} for x in rows])

class LineageGraphView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,asset_id):
        from apps.knowledge.lineage import LineageError,neighborhood
        try:return Response(neighborhood(request.user,asset_id,request.query_params.get("direction","both"),request.query_params.get("depth",3),request.query_params.get("max_nodes")))
        except LineageError as exc:return Response({"detail":str(exc)},status=404)

class LineageImpactView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,asset_id):
        from apps.knowledge.lineage import LineageError,impact_analysis
        try:return Response(impact_analysis(request.user,asset_id,str(request.data.get("change_type","schema")),request.data.get("depth",6)))
        except LineageError as exc:return Response({"detail":str(exc)},status=400)

class LineageScenarioView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from apps.knowledge.lineage import LineageError,save_scenario
        try:scenario=save_scenario(request.user,int(request.data.get("asset_id")),str(request.data.get("change_type","schema")),str(request.data.get("title","")).strip(),str(request.data.get("description","")).strip())
        except (LineageError,TypeError,ValueError) as exc:return Response({"detail":str(exc)},status=400)
        return Response({"id":scenario.id,"asset_id":scenario.asset_id,"change_type":scenario.change_type,"title":scenario.title,"analysis":scenario.analysis},status=201)

class VikkiFeedbackView(APIView):
    authentication_classes = [EntraAccessTokenAuthentication]
    permission_classes=[IsAuthenticated]
    def post(self,request):
        from apps.knowledge.models import MarketplaceProduct, VikkiFeedback
        rating=str(request.data.get("type","")).strip()
        if rating not in {VikkiFeedback.Rating.POSITIVE,VikkiFeedback.Rating.NEGATIVE}:
            return Response({"detail":"type must be positive or negative"},status=400)
        product=None; product_id=request.data.get("productId")
        if product_id: product=get_object_or_404(MarketplaceProduct,owner=request.user,pk=product_id)
        feedback=VikkiFeedback.objects.create(user=request.user,session_id=str(request.data.get("sessionId","") or "")[:255],rating=rating,query=str(request.data.get("lastQuery","") or "")[:10000],answer=str(request.data.get("lastAnswer","") or "")[:20000],correction=str(request.data.get("userCorrection","") or "")[:10000],product=product)
        return Response({"id":feedback.id,"recorded":True},status=201)
