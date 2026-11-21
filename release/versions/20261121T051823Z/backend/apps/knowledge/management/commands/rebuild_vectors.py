from django.core.management.base import BaseCommand, CommandError
from knowledge.models import Document
from knowledge.services import ingest_document
class Command(BaseCommand):
    help = "Re-index every document with the configured embedding provider."
    def add_arguments(self, parser): parser.add_argument("--user", help="Rebuild only documents owned by this username")
    def handle(self, *args, **options):
        documents=Document.objects.select_related("owner").order_by("id")
        if options.get("user"): documents=documents.filter(owner__username=options["user"])
        documents=list(documents)
        if not documents: self.stdout.write(self.style.WARNING("No documents to rebuild.")); return
        total=0
        for document in documents:
            try: count=ingest_document(document)
            except Exception as exc: raise CommandError(f"Failed on {document.title}: {exc}") from exc
            total+=count; self.stdout.write(f"Indexed {document.title} for {document.owner.username}: {count} chunks")
        self.stdout.write(self.style.SUCCESS(f"Rebuilt {total} chunks across {len(documents)} documents."))
