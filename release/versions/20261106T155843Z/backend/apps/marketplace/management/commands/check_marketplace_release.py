from io import StringIO

from django.core.management import BaseCommand, call_command
from django.db import connection
from django.db.migrations.loader import MigrationLoader


class Command(BaseCommand):
    help = "Run release gates for marketplace migrations and Django deployment checks."

    def handle(self, *args, **options):
        loader = MigrationLoader(connection, ignore_no_migrations=True)
        leaves = [node for node in loader.graph.leaf_nodes() if node[0] == "marketplace"]
        expected = [("marketplace", "0052_phase3_search_infrastructure")]
        if leaves != expected:
            raise RuntimeError(f"Unexpected marketplace migration leaves: {leaves}")

        output = StringIO()
        call_command("makemigrations", "marketplace", check=True, dry_run=True, stdout=output)
        call_command("check", deploy=True)
        self.stdout.write(self.style.SUCCESS("Marketplace release checks passed."))
