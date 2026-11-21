from django.core.management.base import BaseCommand
from knowledge.azure_search import ensure_index, upload_chunks
from knowledge.models import DocumentChunk
class Command(BaseCommand):
    help = "Create/update the Azure AI Search index and upload local chunks."
    def add_arguments(self, parser): parser.add_argument("--user", help="Sync only this username")
    def handle(self, *args, **options):
        ensure_index()
        chunks = DocumentChunk.objects.select_related("document", "document__owner").order_by("id")
        if options.get("user"): chunks = chunks.filter(document__owner__username=options["user"])
        chunks = list(chunks)
        results = upload_chunks(chunks)
        failed = [r for r in results if not r.succeeded]
        if failed: raise RuntimeError(f"Azure AI Search rejected {len(failed)} documents")
        self.stdout.write(self.style.SUCCESS(f"Synced {len(chunks)} chunks to Azure AI Search."))
