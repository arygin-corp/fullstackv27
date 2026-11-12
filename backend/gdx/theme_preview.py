"""Read-only snapshot for the theme test pages. No writes, no personal contact fields."""

from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import Lower
from django.http import JsonResponse


def _when(value):
    if value is None:
        return ""
    return value.date().isoformat() if hasattr(value, "date") else str(value)


@login_required
def snapshot(request):
    from apps.changelog.models import Post
    from apps.marketplace.models import Domain, Product, Review
    from apps.orders.models import Request
    from apps.teams.models import Team

    products = Product.objects.select_related("domain", "team").order_by("-created_at")
    requests = Request.objects.annotate(stage_key=Lower("approval_stage"))
    reviews = Review.objects.select_related("product").order_by("-created_at")
    releases = Post.objects.order_by("-release_date")
    teams = Team.objects.annotate(product_count=Count("products")).order_by("name")

    payload = {
        "counts": {
            "products": products.count(),
            "products_approved": products.filter(status__iexact="approved").count(),
            "domains": Domain.objects.count(),
            "teams": teams.count(),
            "reviews": reviews.count(),
            "requests": requests.count(),
            "requests_pending": requests.filter(stage_key__in=["requested", "not yet requested"]).count(),
            "requests_approved": requests.filter(stage_key="approved").count(),
            "requests_rejected": requests.filter(stage_key="rejected").count(),
            "releases": releases.count(),
            "releases_published": releases.filter(status__iexact="published").count(),
        },
        "products": [
            {
                "name": item.name or f"Product {item.id}",
                "sku": item.sku or "",
                "status": item.status or "",
                "domain": item.domain.name if item.domain_id and item.domain else "",
                "team": item.team.name if item.team_id and item.team else "",
                "created": _when(item.created_at),
            }
            for item in products[:24]
        ],
        "teams": [
            {
                "name": item.name,
                "products": item.product_count,
                "created": _when(item.created_at),
            }
            for item in teams
        ],
        "requests": [
            {
                "number": item.number or "",
                "ritm": item.ritm_number or "",
                "approval": item.approval_stage or "",
                "stage": item.stage or "",
                "opened": _when(item.opened_at),
            }
            for item in requests.order_by("-opened_at", "-id")[:20]
        ],
        "reviews": [
            {
                "product": item.product.name if item.product_id and item.product else "",
                "title": item.title or "",
                "rating": item.rating,
                "status": item.status or "",
                "created": _when(item.created_at),
            }
            for item in reviews[:20]
        ],
        "releases": [
            {
                "version": item.version,
                "title": item.get_title_display() if hasattr(item, "get_title_display") else item.title,
                "status": item.status or "",
                "released": _when(item.release_date),
            }
            for item in releases[:12]
        ],
    }
    return JsonResponse(payload)
