import csv,json
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand,CommandError
from django.db import transaction
from knowledge.models import LineageAsset,LineageEdge,LineageNotificationTarget,MarketplaceProduct

def truthy(v): return str(v).strip().lower() in {"1","true","yes","y"}
class Command(BaseCommand):
    help="Import authoritative Data Marketplace lineage assets, edges, and notification targets."
    def add_arguments(self,p): p.add_argument("--user",required=True);p.add_argument("--assets",required=True);p.add_argument("--edges",required=True);p.add_argument("--contacts")
    def rows(self,path):
        if not path:return []
        with open(path,encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
    @transaction.atomic
    def handle(self,*args,**o):
        try:user=get_user_model().objects.get(username=o["user"])
        except get_user_model().DoesNotExist as exc:raise CommandError("User not found") from exc
        products={x.external_id:x for x in MarketplaceProduct.objects.filter(owner=user) if x.external_id}
        assets={}
        for r in self.rows(o["assets"]):
            external=(r.get("external_id") or r.get("id") or "").strip();name=(r.get("name") or "").strip()
            if not external or not name:continue
            obj,_=LineageAsset.objects.update_or_create(owner=user,external_id=external,defaults={"name":name,"kind":r.get("kind") or "dataset","description":r.get("description") or "","system_name":r.get("system_name") or "","environment":r.get("environment") or "","qualified_name":r.get("qualified_name") or "","product":products.get(r.get("product_id")),"steward_name":r.get("steward_name") or "","authoritative":truthy(r.get("authoritative","true")),"active":truthy(r.get("active","true")),"metadata":json.loads(r.get("metadata") or "{}")});assets[external]=obj
        for r in self.rows(o["edges"]):
            up=assets.get(r.get("upstream_id"));down=assets.get(r.get("downstream_id"));relation=r.get("relation") or "depends_on"
            if not up or not down or up.id==down.id:continue
            try:confidence=max(0.0,min(float(r.get("confidence") or 1),1.0))
            except ValueError:confidence=1.0
            LineageEdge.objects.update_or_create(owner=user,upstream=up,downstream=down,relation=relation,defaults={"authoritative":truthy(r.get("authoritative","true")),"confidence":confidence,"source_system":r.get("source_system") or "","source_reference":r.get("source_reference") or "","evidence":r.get("evidence") or "","active":truthy(r.get("active","true")),"metadata":json.loads(r.get("metadata") or "{}")})
        for r in self.rows(o.get("contacts")):
            asset=assets.get(r.get("asset_id"));label=(r.get("label") or "").strip()
            if asset and label:LineageNotificationTarget.objects.update_or_create(asset=asset,label=label,contact_type=r.get("contact_type") or "team",defaults={"email":r.get("email") or "","active":truthy(r.get("active","true")),"authoritative":truthy(r.get("authoritative","true"))})
        self.stdout.write(self.style.SUCCESS(f"Imported {len(assets)} lineage assets."))
