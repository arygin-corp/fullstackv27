from collections import Counter, defaultdict

from django.db.models import Count
from django.db.models.functions import TruncMonth

from .models import Post, ReleaseStatus
from .validators import rich_text_has_content

SECTION_LETTERS = "ABCDEFGHIJ"


def dashboard_metrics(queryset=None):
    """Build dashboard metrics using portable ORM queries and bounded iteration."""
    queryset = queryset if queryset is not None else Post.objects.all()
    status_rows = queryset.values("status").annotate(total=Count("id")).order_by("status")
    status_counts = {choice: 0 for choice, _ in ReleaseStatus.choices}
    status_counts.update({row["status"]: row["total"] for row in status_rows})

    monthly_rows = (
        queryset.filter(status=ReleaseStatus.PUBLISHED, published_at__isnull=False)
        .annotate(month=TruncMonth("published_at"))
        .values("month")
        .annotate(total=Count("id"))
        .order_by("month")
    )
    monthly = [
        {"month": row["month"].date().isoformat(), "label": row["month"].strftime("%b %Y"), "total": row["total"]}
        for row in monthly_rows
    ]

    category_counts = Counter()
    section_count = 0
    releases_with_content = 0
    values = ["id"]
    values += [f"type{letter}__name" for letter in SECTION_LETTERS]
    values += [f"post{letter}" for letter in SECTION_LETTERS]
    for row in queryset.values(*values).iterator():
        has_content = False
        for letter in SECTION_LETTERS:
            content = row.get(f"post{letter}")
            if rich_text_has_content(content):
                has_content = True
                section_count += 1
                category_counts[row.get(f"type{letter}__name") or "Uncategorized"] += 1
        releases_with_content += int(has_content)

    category_usage = [
        {"category": category, "total": total}
        for category, total in sorted(category_counts.items(), key=lambda item: (-item[1], item[0]))
    ]
    total_releases = queryset.count()
    return {
        "total_releases": total_releases,
        "published_releases": status_counts[ReleaseStatus.PUBLISHED],
        "scheduled_releases": queryset.filter(
            status=ReleaseStatus.APPROVED, publish_at__isnull=False
        ).count(),
        "releases_with_content": releases_with_content,
        "section_count": section_count,
        "status_counts": status_counts,
        "monthly_releases": monthly,
        "category_usage": category_usage,
    }
