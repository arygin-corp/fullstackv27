from django.conf import settings
from django.db import transaction
from django.utils import timezone
from .governance import assess_product, steward_payload
from .models import AccessCart, AccessCartItem, AccessProfile, AccessRequest, AccessRequestApproval, AccessRequirement, ApprovalRoute, GovernanceAssessment

class AccessError(ValueError): pass

def profile_for(user):
    profile,_=AccessProfile.objects.get_or_create(user=user)
    return profile

def cart_for(user):
    cart,_=AccessCart.objects.get_or_create(user=user)
    return cart

def requirements_for(product):
    return AccessRequirement.objects.filter(owner=product.owner,active=True).filter(product=product) | AccessRequirement.objects.filter(owner=product.owner,active=True,product__isnull=True,domain=product.domain)

def route_for(product):
    return ApprovalRoute.objects.filter(owner=product.owner,active=True,product=product).prefetch_related("steps__steward","steps__team").first() or ApprovalRoute.objects.filter(owner=product.owner,active=True,product__isnull=True,domain=product.domain).prefetch_related("steps__steward","steps__team").first()

def resolve_route(product):
    route=route_for(product)
    if not route:return []
    stewards=steward_payload(product); by_role={x["role"]:x for x in stewards}; output=[]
    for step in route.steps.all():
        label=""; email=""
        if step.approver_type==step.ApproverType.NAMED_STEWARD and step.steward:
            label=step.steward.display_name; email=step.steward.email
        elif step.approver_type==step.ApproverType.STEWARD_ROLE:
            item=by_role.get(step.steward_role); label=item["name"] if item else step.steward_role; email=item["email"] if item else ""
        elif step.approver_type==step.ApproverType.TEAM and step.team: label=step.team.name
        else: label=step.external_label
        output.append({"position":step.position,"label":label or "Unresolved approver","email":email,"required":step.required,"instructions":step.instructions,"resolved":bool(label)})
    return output

def check_readiness(user,product,justification="",intended_use=""):
    profile=profile_for(user); governance=assess_product(product,persist=False); missing=[]; satisfied=[]
    for req in requirements_for(product).distinct().order_by("priority"):
        ok=False
        if req.kind==AccessRequirement.Kind.JUSTIFICATION: ok=len(justification.strip())>=settings.ACCESS_DEFAULT_JUSTIFICATION_MIN_LENGTH
        elif req.kind==AccessRequirement.Kind.TRAINING: ok=req.value in profile.completed_trainings
        elif req.kind==AccessRequirement.Kind.ATTESTATION: ok=req.value in profile.accepted_attestations
        elif req.kind==AccessRequirement.Kind.ROLE: ok=profile.job_role.casefold()==req.value.casefold()
        elif req.kind in {AccessRequirement.Kind.APPROVAL,AccessRequirement.Kind.DATA_REVIEW,AccessRequirement.Kind.SECURITY_REVIEW}: ok=True
        elif req.kind==AccessRequirement.Kind.DOCUMENT: ok=False
        item={"id":req.id,"name":req.name,"kind":req.kind,"value":req.value,"instructions":req.instructions,"required":req.required,"satisfied":ok,"authoritative":req.authoritative}
        (satisfied if ok or not req.required else missing).append(item)
    if not intended_use.strip(): missing.append({"name":"Intended use","kind":"intended_use","required":True,"satisfied":False})
    if governance["status"] in {GovernanceAssessment.Status.PROHIBITED,GovernanceAssessment.Status.RESTRICTED}: missing.append({"name":"Governance clearance","kind":"governance","required":True,"satisfied":False,"status":governance["status"]})
    if settings.ACCESS_REQUIRE_GOVERNANCE_CLEARANCE and governance["status"]==GovernanceAssessment.Status.UNKNOWN: missing.append({"name":"Authoritative governance data","kind":"governance","required":True,"satisfied":False,"status":"unknown"})
    route=resolve_route(product)
    if any(x["required"] and not x["resolved"] for x in route): missing.append({"name":"Approval route","kind":"approval_route","required":True,"satisfied":False})
    ready=not missing
    return {"ready":ready,"missing":missing,"satisfied":satisfied,"governance":governance,"approval_route":route,"profile":{"organization":profile.organization,"department":profile.department,"job_role":profile.job_role,"completed_trainings":profile.completed_trainings,"accepted_attestations":profile.accepted_attestations}}

@transaction.atomic
def add_to_cart(user,product,justification="",intended_use=""):
    cart=cart_for(user)
    if cart.items.count()>=settings.ACCESS_MAX_CART_ITEMS and not cart.items.filter(product=product).exists(): raise AccessError("Cart item limit reached")
    item,_=AccessCartItem.objects.update_or_create(cart=cart,product=product,defaults={"business_justification":justification,"intended_use":intended_use})
    return item

@transaction.atomic
def create_draft_requests(user):
    cart=cart_for(user); requests=[]
    for item in cart.items.select_related("product","product__domain","product__data_type"):
        readiness=check_readiness(user,item.product,item.business_justification,item.intended_use)
        status=AccessRequest.Status.READY if readiness["ready"] else AccessRequest.Status.DRAFT
        request=AccessRequest.objects.create(owner=user,product=item.product,status=status,business_justification=item.business_justification,intended_use=item.intended_use,readiness_snapshot={k:v for k,v in readiness.items() if k!="governance"},governance_snapshot=readiness["governance"],route_snapshot=readiness["approval_route"])
        for step in readiness["approval_route"]:
            AccessRequestApproval.objects.create(request=request,position=step["position"],approver_label=step["label"],approver_email=step["email"])
        requests.append(request)
    return requests

def submit_request(request):
    if not settings.ACCESS_ALLOW_REQUEST_SUBMISSION: raise AccessError("Request submission is disabled. Review the draft and submit through the authoritative access system.")
    readiness=check_readiness(request.owner,request.product,request.business_justification,request.intended_use)
    if not readiness["ready"]: raise AccessError("Request is not ready for submission")
    request.status=AccessRequest.Status.SUBMITTED; request.submitted_at=timezone.now(); request.readiness_snapshot={k:v for k,v in readiness.items() if k!="governance"}; request.governance_snapshot=readiness["governance"]; request.route_snapshot=readiness["approval_route"]; request.save()
    return request
