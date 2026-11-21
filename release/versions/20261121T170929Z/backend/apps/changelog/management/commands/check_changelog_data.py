from django.core.management.base import BaseCommand
from django.utils.html import strip_tags
from apps.changelog.models import Categorie, Post

class Command(BaseCommand):
    help = "Read-only report of legacy changelog data conditions relevant to the upgrade."

    def handle(self, *args, **options):
        category_ids = set(Categorie.objects.values_list("id", flat=True))
        incomplete = 0
        whitespace_only = 0
        for post in Post.objects.iterator():
            for letter in "ABCDEFGHIJ":
                subtitle = getattr(post, f"subTitle{letter}")
                category_id = getattr(post, f"type{letter}_id")
                content = getattr(post, f"post{letter}")
                normalized = strip_tags(str(content or "")).replace("\xa0", " ").strip()
                if content and not normalized:
                    whitespace_only += 1
                if normalized and not category_id:
                    incomplete += 1
                if category_id and category_id not in category_ids:
                    self.stdout.write(self.style.ERROR(f"Post {post.pk} section {letter} references missing category {category_id}"))
        self.stdout.write(f"Categories: {Categorie.objects.count()}")
        self.stdout.write(f"Posts: {Post.objects.count()}")
        self.stdout.write(f"Content sections without category: {incomplete}")
        self.stdout.write(f"Whitespace-only content sections: {whitespace_only}")

        published_without_timestamp = Post.objects.filter(
            status="PUBLISHED",
            published_at__isnull=True,
        ).count()

        self.stdout.write(
            f"Published releases without published_at: "
            f"{published_without_timestamp}"
        )

        if published_without_timestamp:
            self.stdout.write(
                self.style.ERROR(
                    "Published releases with a null published_at value were found."
                )
            )





















































