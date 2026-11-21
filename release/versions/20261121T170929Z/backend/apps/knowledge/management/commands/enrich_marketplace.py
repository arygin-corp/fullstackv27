from django.core.management.base import BaseCommand, CommandError
from knowledge.marketplace import enrich_product, rebuild_similarities
from knowledge.models import MarketplaceProduct
class Command(BaseCommand):
    help="Generate Data Marketplace product intelligence and similarity links."
    def add_arguments(self,parser): parser.add_argument("--user",required=True); parser.add_argument("--failed-only",action="store_true")
    def handle(self,*args,**o):
        qs=MarketplaceProduct.objects.filter(owner__username=o["user"])
        if o["failed_only"]: qs=qs.filter(intelligence_status="failed")
        failed=0
        for p in qs: enrich_product(p); failed += p.intelligence_status=="failed"
        links=rebuild_similarities(qs.first().owner) if qs.exists() else 0
        if failed: raise CommandError(f"Enrichment failed for {failed} product(s).")
        self.stdout.write(self.style.SUCCESS(f"Enriched {qs.count()} products and created {links} similarity links."))
