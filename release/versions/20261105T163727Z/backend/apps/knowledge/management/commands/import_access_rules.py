import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from knowledge.models import AccessRequirement, ApprovalRoute, ApprovalRouteStep, GovernanceSteward, MarketplaceDomain, MarketplaceProduct, MarketplaceTeam

def truthy(v): return str(v).strip().lower() in {"1","true","yes","y"}
class Command(BaseCommand):
    help="Import authoritative access requirements and approval routes."
    def add_arguments(self,p): p.add_argument("--user",required=True); p.add_argument("--requirements"); p.add_argument("--routes"); p.add_argument("--steps")
    def rows(self,path):
        if not path:return []
        with open(path,encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
    @transaction.atomic
    def handle(self,*args,**o):
        try:user=get_user_model().objects.get(username=o["user"])
        except get_user_model().DoesNotExist as exc:raise CommandError("User not found") from exc
        products={x.external_id:x for x in MarketplaceProduct.objects.filter(owner=user) if x.external_id}; domains={x.name.casefold():x for x in MarketplaceDomain.objects.filter(owner=user)}
        for r in self.rows(o.get("requirements")):
            product=products.get(r.get("product_id"));domain=domains.get((r.get("domain") or "").casefold());name=(r.get("name") or "").strip()
            if not name:continue
            AccessRequirement.objects.update_or_create(owner=user,product=product,domain=domain,name=name,defaults={"kind":r.get("kind") or "justification","value":r.get("value") or "","instructions":r.get("instructions") or "","required":truthy(r.get("required","true")),"authoritative":truthy(r.get("authoritative","true")),"active":truthy(r.get("active","true")),"priority":int(r.get("priority") or 100)})
        route_map={}
        for r in self.rows(o.get("routes")):
            product=products.get(r.get("product_id"));domain=domains.get((r.get("domain") or "").casefold());name=(r.get("name") or "").strip()
            if not name:continue
            route,_=ApprovalRoute.objects.update_or_create(owner=user,product=product,domain=domain,name=name,defaults={"active":truthy(r.get("active","true")),"priority":int(r.get("priority") or 100)});route_map[r.get("route_id") or name]=route
        stewards={str(x.id):x for x in GovernanceSteward.objects.filter(owner=user)};teams={x.name.casefold():x for x in MarketplaceTeam.objects.filter(owner=user)}
        for r in self.rows(o.get("steps")):
            route=route_map.get(r.get("route_id") or r.get("route_name"));position=int(r.get("position") or 1)
            if not route:continue
            ApprovalRouteStep.objects.update_or_create(route=route,position=position,defaults={"approver_type":r.get("approver_type") or "external","steward_role":r.get("steward_role") or "","steward":stewards.get(r.get("steward_id")),"team":teams.get((r.get("team") or "").casefold()),"external_label":r.get("external_label") or "","required":truthy(r.get("required","true")),"instructions":r.get("instructions") or ""})
        self.stdout.write(self.style.SUCCESS("Access rules import completed."))
