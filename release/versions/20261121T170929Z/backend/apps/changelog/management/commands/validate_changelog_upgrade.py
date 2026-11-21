from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from apps.changelog.models import Categorie, Post, ReleaseStatus

EXPECTED = {
    Categorie._meta.db_table: {
        "id", "name", "slug", "published_date", "desc", "is_active",
        "created_by_id", "created_at", "updated_by_id", "updated_at",
    },
    Post._meta.db_table: {
        "id", "version", "release_date", "title", "desc", "is_active",
        "created_by_id", "created_at", "updated_by_id", "updated_at",
        *{f"subTitle{x}" for x in "ABCDEFGHIJ"},
        *{f"type{x}_id" for x in "ABCDEFGHIJ"},
        *{f"post{x}" for x in "ABCDEFGHIJ"},
    },
}

class Command(BaseCommand):
    help = "Validate that legacy changelog tables and columns are present before applying the upgrade."

    def handle(self, *args, **options):
        failures = []
        missing_timestamp = (Post.objects.filter(status=ReleaseStatus.PUBLISHED, published_at__isnull=True, ).count())

        with connection.cursor() as cursor:
            tables = set(connection.introspection.table_names(cursor))
            failures = []

            if missing_timestamp:
                failures.append(
                    f"{missing_timestamp} "
                    f"published releases "
                    f"missing published_at"
                )

            if failures:
                raise CommandError("; ".join(failures))

            self.stdout.write(self.style.SUCCESS("Validation passed."))

            for table, expected_columns in EXPECTED.items():
                if table not in tables:
                    failures.append(f"Missing table: {table}")
                    continue
                description = connection.introspection.get_table_description(cursor, table)
                actual = {column.name for column in description}
                missing = sorted(expected_columns - actual)
                if missing:
                    failures.append(f"{table} missing columns: {', '.join(missing)}")
            if failures:
                raise CommandError("; ".join(failures))
        self.stdout.write(self.style.SUCCESS("Legacy changelog tables and required columns are compatible."))