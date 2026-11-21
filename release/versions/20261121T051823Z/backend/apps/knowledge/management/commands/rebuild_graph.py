from django.core.management.base import BaseCommand, CommandError
from knowledge.intelligence import enrich_document
from knowledge.models import Document
class Command(BaseCommand):
    help="Re-extract document intelligence, entity relations, and timeline events."
    def add_arguments(self,parser):
        parser.add_argument("--user"); parser.add_argument("--document-id",type=int)
    def handle(self,*args,**options):
        qs=Document.objects.select_related("owner").order_by("id")
        if options.get("user"): qs=qs.filter(owner__username=options["user"])
        if options.get("document_id"): qs=qs.filter(pk=options["document_id"])
        docs=list(qs)
        if not docs: self.stdout.write(self.style.WARNING("No matching documents.")); return
        failed=0
        for doc in docs:
            enrich_document(doc); doc.refresh_from_db(); failed += doc.intelligence_status==Document.IntelligenceStatus.FAILED
            self.stdout.write(f"{doc.id} {doc.title}: {doc.intelligence_status}, {doc.entity_relations.count()} relations, {doc.timeline_events.count()} events")
        if failed: raise CommandError(f"Graph extraction failed for {failed} document(s).")
        self.stdout.write(self.style.SUCCESS(f"Rebuilt graph intelligence for {len(docs)} document(s)."))
