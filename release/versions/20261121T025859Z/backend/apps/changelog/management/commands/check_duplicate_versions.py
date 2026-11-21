from django.core.management.base import (
    BaseCommand,
    CommandError,
)
from django.db.models import Count

from apps.changelog.models import Post


class Command(BaseCommand):
    help = "Find duplicate changelog versions"

    def handle(self, *args, **kwargs):
        duplicates = (
            Post.objects
            .values("version")
            .annotate(total=Count("id"))
            .filter(total__gt=1)
            .order_by("version")
        )

        if not duplicates.exists():
            self.stdout.write(
                self.style.SUCCESS(
                    "No duplicate versions found."
                )
            )
            return

        for row in duplicates:
            self.stdout.write(
                self.style.ERROR(
                    f"Version: {row['version']} "
                    f"({row['total']} records)"
                )
            )

        raise CommandError(
            "Duplicate versions must be resolved."
        )