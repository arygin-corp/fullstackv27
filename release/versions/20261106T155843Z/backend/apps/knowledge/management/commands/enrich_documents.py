from django.core.management.base import BaseCommand, CommandError
from knowledge.intelligence import enrich_document
from knowledge.models import Document
class Command(BaseCommand):
    help="Generate summaries, topics, risks, actions, suggested questions, and entities for existing documents."
    def add_arguments(self, parser):
        parser.add_argument("--user", help="Process only this username")
        parser.add_argument("--document-id", type=int)
        parser.add_argument("--failed-only", action="store_true")
    def handle(self,*args,**options):
        qs=Document.objects.select_related("owner").order_by("id")
        if options.get("user"): qs=qs.filter(owner__username=options["user"])
        if options.get("document_id"): qs=qs.filter(pk=options["document_id"])
        if options.get("failed_only"): qs=qs.filter(intelligence_status=Document.IntelligenceStatus.FAILED)
        documents=list(qs)
        if not documents: self.stdout.write(self.style.WARNING("No matching documents.")); return
        failures=0
        for document in documents:
            enrich_document(document); document.refresh_from_db()
            self.stdout.write(f"{document.id} {document.title}: {document.intelligence_status}")
            failures += document.intelligence_status == Document.IntelligenceStatus.FAILED
        if failures: raise CommandError(f"Knowledge extraction failed for {failures} document(s). See intelligence_error in admin.")
        self.stdout.write(self.style.SUCCESS(f"Enriched {len(documents)} document(s)."))
