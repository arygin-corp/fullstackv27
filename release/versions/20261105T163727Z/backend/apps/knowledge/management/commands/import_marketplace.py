import csv
from pathlib import Path
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify
from knowledge.marketplace import enrich_product
from knowledge.models import MarketplaceDataType, MarketplaceDomain, MarketplaceProduct, MarketplaceTeam

def truthy(value): return str(value).strip().lower() in {"1","true","yes","y"}
class Command(BaseCommand):
    help="Import Data Marketplace CSV exports for one application user."
    def add_arguments(self,parser):
        parser.add_argument("--user",required=True); parser.add_argument("--products",required=True); parser.add_argument("--domains"); parser.add_argument("--datatypes"); parser.add_argument("--teams"); parser.add_argument("--enrich",action="store_true")
    def rows(self,path):
        with open(path,encoding="utf-8-sig",newline="") as handle: return list(csv.DictReader(handle))
    @transaction.atomic
    def handle(self,*args,**o):
        try: user=get_user_model().objects.get(username=o["user"])
        except get_user_model().DoesNotExist as exc: raise CommandError("User not found") from exc
        for path,model,fields in [(o.get("domains"),MarketplaceDomain,("name","description")),(o.get("datatypes"),MarketplaceDataType,("name","value")),(o.get("teams"),MarketplaceTeam,("name","route_id"))]:
            if not path: continue
            for row in self.rows(path):
                name=(row.get("name") or "").strip()
                if not name: continue
                defaults={field:(row.get(field) or "").strip() for field in fields if field!="name"}; defaults.update(external_id=(row.get("id") or "").strip(),active=truthy(row.get("is_active","true")))
                if model is MarketplaceDomain: defaults["slug"]=(row.get("slug") or slugify(name))[:255]
                model.objects.update_or_create(owner=user,name=name,defaults=defaults)
        domains={str(x.external_id):x for x in MarketplaceDomain.objects.filter(owner=user)}; datatypes={str(x.external_id):x for x in MarketplaceDataType.objects.filter(owner=user)}; teams={str(x.external_id):x for x in MarketplaceTeam.objects.filter(owner=user)}
        count=0
        for row in self.rows(o["products"]):
            name=(row.get("name") or "").strip()
            if not name: continue
            external=(row.get("id") or "").strip(); lookup={"owner":user,"external_id":external} if external else {"owner":user,"name":name}
            product,_=MarketplaceProduct.objects.update_or_create(**lookup,defaults={"name":name,"slug":row.get("slug") or slugify(name),"sku":row.get("sku") or "","brief_description":row.get("brief_desc") or "","short_description":row.get("short_desc") or "","intended_use":row.get("intended_use") or "","resource_url":row.get("resource_url") or "","status":row.get("status") or "draft","active":truthy(row.get("is_active","true")),"contains_pi":truthy(row.get("pi")),"contains_sensitive_pi":truthy(row.get("sensitive_pi")),"data_review_required":truthy(row.get("data_review_required")),"access_type":row.get("access_type") or "","environment":row.get("environment") or "","availability":row.get("availability") or "","frequency":row.get("frequency") or "","domain":domains.get(str(row.get("domain_id") or "")),"data_type":datatypes.get(str(row.get("datatype_id") or "")),"fulfillment_team":teams.get(str(row.get("fulfillment_group_id") or ""))})
            if o["enrich"]: enrich_product(product)
            count+=1
        self.stdout.write(self.style.SUCCESS(f"Imported or updated {count} products."))
