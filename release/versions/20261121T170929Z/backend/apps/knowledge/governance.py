import json
from collections import Counter
from django.conf import settings
from django.db.models import Count, Q
from ai_providers.base import ChatMessage
from ai_providers.factory import get_chat_provider
from .models import GovernanceAssessment, GovernancePolicy, GovernanceRule, GovernanceSteward, MarketplaceProduct

EXPLAIN_PROMPT = """Explain the supplied Data Marketplace governance assessment in plain language. Use only the supplied product metadata, matched authoritative rules, and requirements. Do not invent approvals, training, owners, policies, eligibility, or decisions. Clearly say when authoritative data is missing. Return text only."""

def _matches(product, rule):
    kind=rule.condition_type; expected=rule.condition_value.strip().casefold()
    if kind==GovernanceRule.Condition.ALWAYS: return True
    if kind==GovernanceRule.Condition.CONTAINS_PI: return product.contains_pi
    if kind==GovernanceRule.Condition.CONTAINS_SENSITIVE_PI: return product.contains_sensitive_pi
    if kind==GovernanceRule.Condition.DATA_REVIEW_REQUIRED: return product.data_review_required
    if kind==GovernanceRule.Condition.STATUS: return product.status.casefold()==expected
    if kind==GovernanceRule.Condition.DOMAIN: return bool(product.domain and product.domain.name.casefold()==expected)
    if kind==GovernanceRule.Condition.DATA_TYPE: return bool(product.data_type and product.data_type.name.casefold()==expected)
    if kind==GovernanceRule.Condition.ACCESS_TYPE: return product.access_type.casefold()==expected
    if kind==GovernanceRule.Condition.ENVIRONMENT: return product.environment.casefold()==expected
    return False

def applicable_rules(product):
    direct=GovernanceRule.objects.filter(policy__product_assignments__product=product,policy__active=True,active=True)
    shared=GovernanceRule.objects.filter(owner=product.owner,policy__active=True,active=True).filter(Q(condition_type=GovernanceRule.Condition.ALWAYS)|Q(condition_type=GovernanceRule.Condition.CONTAINS_PI)|Q(condition_type=GovernanceRule.Condition.CONTAINS_SENSITIVE_PI)|Q(condition_type=GovernanceRule.Condition.DATA_REVIEW_REQUIRED)|Q(condition_type=GovernanceRule.Condition.STATUS)|Q(condition_type=GovernanceRule.Condition.DOMAIN)|Q(condition_type=GovernanceRule.Condition.DATA_TYPE)|Q(condition_type=GovernanceRule.Condition.ACCESS_TYPE)|Q(condition_type=GovernanceRule.Condition.ENVIRONMENT))
    return (direct|shared).select_related("policy").distinct().order_by("priority")[:settings.GOVERNANCE_MAX_RULES_PER_PRODUCT]

def steward_payload(product):
    assigned=product.steward_assignments.select_related("steward","steward__domain","steward__team").filter(steward__active=True)
    rows=[{"id":x.steward_id,"name":x.steward.display_name,"email":x.steward.email,"role":x.steward.role,"role_label":x.steward.get_role_display(),"domain":x.steward.domain.name if x.steward.domain else None,"team":x.steward.team.name if x.steward.team else None,"primary":x.primary} for x in assigned]
    if not rows and product.domain_id:
        rows=[{"id":x.id,"name":x.display_name,"email":x.email,"role":x.role,"role_label":x.get_role_display(),"domain":x.domain.name if x.domain else None,"team":x.team.name if x.team else None,"primary":False} for x in GovernanceSteward.objects.filter(owner=product.owner,domain=product.domain,active=True)]
    return rows

def assess_product(product, persist=True):
    matched=[]; requirements=[]; missing=[]
    policies=GovernancePolicy.objects.filter(owner=product.owner,active=True)
    if settings.GOVERNANCE_REQUIRE_AUTHORITATIVE_RULES and not policies.filter(authoritative=True).exists(): missing.append("No active authoritative governance policy is configured.")
    if not product.domain_id: missing.append("Product domain is not defined.")
    if not product.data_type_id: missing.append("Product data type is not defined.")
    stewards=steward_payload(product)
    if not stewards and not product.steward_name: missing.append("No steward assignment is available.")
    for rule in applicable_rules(product):
        if _matches(product,rule):
            item={"rule_id":rule.id,"rule":rule.name,"policy_id":rule.policy_id,"policy":rule.policy.name,"policy_version":rule.policy.version,"authoritative":rule.policy.authoritative,"severity":rule.policy.severity,"requirement_type":rule.requirement_type,"requirement_value":rule.requirement_value,"message":rule.message,"source_url":rule.policy.source_url}
            matched.append(item); requirements.append({"type":rule.requirement_type,"value":rule.requirement_value,"message":rule.message,"policy":rule.policy.name})
    types={x["requirement_type"] for x in matched}; severities={x["severity"] for x in matched}
    if GovernanceRule.Requirement.PROHIBIT in types or GovernancePolicy.Severity.PROHIBITED in severities: status=GovernanceAssessment.Status.PROHIBITED
    elif GovernanceRule.Requirement.RESTRICT in types or GovernancePolicy.Severity.RESTRICTED in severities: status=GovernanceAssessment.Status.RESTRICTED
    elif requirements: status=GovernanceAssessment.Status.ACTION_REQUIRED
    elif missing: status=GovernanceAssessment.Status.UNKNOWN
    else: status=GovernanceAssessment.Status.CLEAR
    evidence={"product":{"id":product.id,"name":product.name,"domain":product.domain.name if product.domain else None,"data_type":product.data_type.name if product.data_type else None,"contains_pi":product.contains_pi,"contains_sensitive_pi":product.contains_sensitive_pi,"data_review_required":product.data_review_required,"status":product.status,"access_type":product.access_type,"environment":product.environment},"status":status,"matched_rules":matched,"requirements":requirements,"missing_authoritative_data":missing,"stewards":stewards}
    explanation=""
    if settings.GOVERNANCE_ALLOW_LLM_EXPLANATIONS:
        try: explanation=get_chat_provider().complete([ChatMessage("system",EXPLAIN_PROMPT),ChatMessage("user",json.dumps(evidence,ensure_ascii=False))]).strip()
        except Exception: explanation=""
    if not explanation:
        explanation=f"Assessment status: {status}. Matched {len(matched)} configured rule(s)."
        if missing: explanation += " Missing authoritative data: " + "; ".join(missing)
    if persist:
        GovernanceAssessment.objects.create(owner=product.owner,product=product,status=status,matched_rules=matched,requirements=requirements,missing_authoritative_data=missing,explanation=explanation)
    evidence["explanation"]=explanation
    return evidence

def governance_search(user,query="",role="",domain=""):
    qs=GovernanceSteward.objects.filter(owner=user,active=True).select_related("domain","team").annotate(product_count=Count("product_assignments",distinct=True))
    if query: qs=qs.filter(Q(display_name__icontains=query)|Q(email__icontains=query)|Q(notes__icontains=query)|Q(team__name__icontains=query))
    if role: qs=qs.filter(role=role)
    if domain: qs=qs.filter(domain__name__iexact=domain)
    return qs

def workload_summary(user):
    rows=GovernanceSteward.objects.filter(owner=user,active=True).annotate(product_count=Count("product_assignments",distinct=True)).order_by("-product_count","display_name")
    return [{"id":x.id,"name":x.display_name,"role":x.role,"domain":x.domain.name if x.domain else None,"product_count":x.product_count,"capacity":x.capacity} for x in rows]
