import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from knowledge.models import GovernancePolicy, GovernanceRule, GovernanceSteward, MarketplaceDomain, MarketplaceTeam

def truthy(v): return str(v).strip().lower() in {"1","true","yes","y"}
class Command(BaseCommand):
    help="Import authoritative governance policies, rules, and steward assignments from CSV files."
    def add_arguments(self,p):
        p.add_argument("--user",required=True); p.add_argument("--policies"); p.add_argument("--rules"); p.add_argument("--stewards")
    def rows(self,path):
        if not path:return []
        with open(path,encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
    @transaction.atomic
    def handle(self,*args,**o):
        try:user=get_user_model().objects.get(username=o["user"])
        except get_user_model().DoesNotExist as exc:raise CommandError("User not found") from exc
        policy_map={}
        for r in self.rows(o.get("policies")):
            name=(r.get("name") or "").strip(); version=(r.get("version") or "").strip()
            if not name:continue
            obj,_=GovernancePolicy.objects.update_or_create(owner=user,name=name,version=version,defaults={"external_id":r.get("external_id") or r.get("id") or "","description":r.get("description") or "","severity":r.get("severity") or "required","authoritative":truthy(r.get("authoritative","true")),"active":truthy(r.get("active","true")),"source_url":r.get("source_url") or ""});policy_map[r.get("external_id") or r.get("id") or name]=obj
        for r in self.rows(o.get("rules")):
            policy=policy_map.get(r.get("policy_id") or r.get("policy_name")) or GovernancePolicy.objects.filter(owner=user,name=r.get("policy_name")).first()
            if not policy or not r.get("name"):continue
            GovernanceRule.objects.update_or_create(owner=user,policy=policy,name=r["name"],defaults={"condition_type":r.get("condition_type") or "always","condition_value":r.get("condition_value") or "","requirement_type":r.get("requirement_type") or "notice","requirement_value":r.get("requirement_value") or "","message":r.get("message") or "","priority":int(r.get("priority") or 100),"active":truthy(r.get("active","true"))})
        domains={x.name.casefold():x for x in MarketplaceDomain.objects.filter(owner=user)};teams={x.name.casefold():x for x in MarketplaceTeam.objects.filter(owner=user)}
        for r in self.rows(o.get("stewards")):
            name=(r.get("display_name") or r.get("name") or "").strip();role=r.get("role") or "data_steward"
            if not name:continue
            GovernanceSteward.objects.update_or_create(owner=user,display_name=name,role=role,domain=domains.get((r.get("domain") or "").casefold()),defaults={"external_id":r.get("external_id") or r.get("id") or "","email":r.get("email") or "","team":teams.get((r.get("team") or "").casefold()),"active":truthy(r.get("active","true")),"capacity":int(r["capacity"]) if r.get("capacity") else None,"notes":r.get("notes") or ""})
        self.stdout.write(self.style.SUCCESS("Governance import completed."))
