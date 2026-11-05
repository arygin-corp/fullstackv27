from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.changelog.models import Post, ReleaseStatus
from apps.changelog.services import publish_release


class Command(BaseCommand):
    help = "Publish approved changelog releases whose scheduled time has arrived."

    def handle(self, *args, **options):
        now = timezone.now()
        due = Post.objects.filter(
            status=ReleaseStatus.APPROVED,
            publish_at__isnull=False,
            publish_at__lte=now,
        ).order_by("publish_at", "pk")
        count = 0
        for post in due.iterator():
            publish_release(post, now=now)
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Published {count} due release(s)."))

        count = 0
        failed = 0

        for post in due.iterator():

            try:
                publish_release(
                    post,
                    now=now,
                )

                count += 1

            except Exception as exc:

                failed += 1

                self.stderr.write(
                    self.style.ERROR(
                        f"Failed release "
                        f"{post.pk}: {exc}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Published {count} release(s), "
                f"{failed} failed."
            )
        )
