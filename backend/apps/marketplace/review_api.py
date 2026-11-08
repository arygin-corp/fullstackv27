"""Product reviews for the marketplace product page."""

from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.authentication import MarketplaceSignInAuthentication
from apps.third_party_apis.modules.vikki.chat.authentication import EntraAccessTokenAuthentication

from .models import Product, Review

PAGE_SIZE = 10


def _published_product(key):
    queryset = Product.objects.published().defer("alt_approver")
    lookup = str(key or "").strip()
    if lookup.isdigit():
        return get_object_or_404(queryset, pk=int(lookup))
    return get_object_or_404(queryset, slug=lookup)


def _display_name(user):
    name = (getattr(user, "first_name", "") or "").strip()
    if name:
        return name
    email = (getattr(user, "email", "") or "").strip()
    if email and "@" in email:
        return email.split("@", 1)[0]
    return "Reviewer"


def _avatar_url(request, user):
    try:
        image = user.profile.image
    except ObjectDoesNotExist:
        return ""
    name = str(getattr(image, "name", "") or "")
    if not name or name.endswith("default.gif"):
        return ""
    try:
        url = image.url
    except ValueError:
        return ""
    if request is None:
        return url
    return request.build_absolute_uri(url)


def _serialize_review(review, request=None):
    return {
        "id": review.id,
        "product_id": review.product_id,
        "author": {
            "id": review.author_id,
            "display_name": _display_name(review.author),
            "avatar": _avatar_url(request, review.author),
        },
        "rating": review.rating,
        "title": review.title or "",
        "comment": review.comment or "",
        "quality": review.quality,
        "value_for_money": review.value_for_money,
        "ease_of_use": review.ease_of_use,
        "durability": review.durability,
        "would_recommend": review.would_recommend,
        "met_expectations": review.met_expectations,
        "verified_purchaser": bool(review.verified_purchaser),
        "status": review.status,
        "created_at": review.created_at.isoformat(),
    }


def _summary(product):
    published = Review.objects.filter(product=product, status="approved")
    counts = {
        f"r{star}": Count("id", filter=Q(rating=star))
        for star in range(1, 6)
    }
    totals = published.aggregate(
        average=Avg("rating"),
        review_count=Count("id"),
        recommended_count=Count(
            "id",
            filter=Q(would_recommend=True) | Q(would_recommend__isnull=True, rating__gte=4),
        ),
        quality=Avg("quality"),
        value=Avg("value_for_money"),
        ease_of_use=Avg("ease_of_use"),
        durability=Avg("durability"),
        **counts,
    )
    review_count = totals["review_count"] or 0
    recommended = totals["recommended_count"] or 0

    def category_percent(average):
        if average is None:
            return 0
        return round(float(average) * 20)

    return {
        "average_rating": round(float(totals["average"] or 0), 1),
        "review_count": review_count,
        "recommended_count": recommended,
        "recommended_percentage": round(recommended * 100 / review_count) if review_count else 0,
        "rating_distribution": {
            str(star): totals[f"r{star}"] or 0
            for star in range(1, 6)
        },
        "category_ratings": {
            "quality": category_percent(totals["quality"]),
            "value": category_percent(totals["value"]),
            "ease_of_use": category_percent(totals["ease_of_use"]),
            "durability": category_percent(totals["durability"]),
        },
    }


def _shadow_user(claims):
    tid = str(claims.get("tid") or "").strip()
    oid = str(claims.get("oid") or "").strip()
    if not tid or not oid:
        return None
    User = get_user_model()
    username = f"entra:{tid}:{oid}"
    name = str(claims.get("name") or "")[:150]
    email = str(claims.get("email") or claims.get("preferred_username") or "")[:254]
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "first_name": name,
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
        },
    )
    updates = []
    if email and user.email != email:
        user.email = email
        updates.append("email")
    if name and user.first_name != name:
        user.first_name = name
        updates.append("first_name")
    if created:
        user.set_unusable_password()
        updates.append("password")
    if updates:
        user.save(update_fields=list(dict.fromkeys(updates)))
    return user


def _signed_in_user(request):
    try:
        authenticated = EntraAccessTokenAuthentication().authenticate(request)
    except AuthenticationFailed:
        authenticated = None
    if authenticated:
        user = authenticated[0]
        if getattr(user, "pk", None):
            return user
    try:
        authenticated = MarketplaceSignInAuthentication().authenticate(request)
    except AuthenticationFailed:
        return None
    if not authenticated:
        return None
    return _shadow_user(authenticated[1])


def _stars(data, name):
    raw = data.get(name)
    if raw in (None, ""):
        return None
    try:
        value = int(raw)
    except (TypeError, ValueError):
        return None
    return value if value in range(1, 6) else None


def _yes_no(data, name):
    raw = data.get(name)
    if isinstance(raw, bool):
        return raw
    text = str(raw).strip().lower()
    if text in {"yes", "true", "1"}:
        return True
    if text in {"no", "false", "0"}:
        return False
    return None


def _review_payload(data):
    rating = _stars(data, "rating")
    title = str(data.get("title") or "").strip()
    comment = str(data.get("comment") or "").strip()
    quality = _stars(data, "quality")
    value_for_money = _stars(data, "value_for_money")
    ease_of_use = _stars(data, "ease_of_use")
    durability = _stars(data, "durability")
    would_recommend = _yes_no(data, "would_recommend")
    met_expectations = _yes_no(data, "met_expectations")
    missing = []
    if rating is None:
        missing.append("overall rating")
    if not title:
        missing.append("review title")
    if not comment:
        missing.append("review comment")
    if quality is None:
        missing.append("product quality")
    if value_for_money is None:
        missing.append("value for money")
    if ease_of_use is None:
        missing.append("ease of use")
    if would_recommend is None:
        missing.append("whether you would recommend this product")
    if met_expectations is None:
        missing.append("whether the product met your expectations")
    if missing:
        return None, "Required: " + ", ".join(missing) + "."
    return {
        "rating": rating,
        "title": title[:150],
        "comment": comment,
        "quality": quality,
        "value_for_money": value_for_money,
        "ease_of_use": ease_of_use,
        "durability": durability,
        "would_recommend": would_recommend,
        "met_expectations": met_expectations,
    }, None


def _verified_purchaser(user, product):
    username = str(getattr(user, "username", "") or "")
    parts = username.split(":")
    oid = parts[-1] if len(parts) == 3 and parts[0] == "entra" else ""
    if not oid:
        return False
    identifiers = {
        str(product.pk),
        str(getattr(product, "sku", "") or "").strip(),
        str(getattr(product, "slug", "") or "").strip(),
    }
    identifiers.discard("")
    from apps.orders.models import Request
    from apps.third_party_apis.modules.onets_order_history.models import OrderHistoryRequest

    if Request.objects.filter(object_id=oid, product_id__in=identifiers).exists():
        return True
    return OrderHistoryRequest.objects.filter(object_id=oid).filter(
        Q(product_id__in=identifiers) | Q(product_identifier__in=identifiers)
    ).exists()


class ProductReviewListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, pk):
        product = _published_product(pk)
        try:
            page = max(int(request.query_params.get("page") or 1), 1)
        except (TypeError, ValueError):
            page = 1
        reviews = Review.objects.filter(product=product, status="approved").select_related("author", "author__profile")
        total = reviews.count()
        pages = max((total + PAGE_SIZE - 1) // PAGE_SIZE, 1)
        page = min(page, pages)
        start = (page - 1) * PAGE_SIZE
        return Response({
            "summary": _summary(product),
            "reviews": [_serialize_review(review, request) for review in reviews[start:start + PAGE_SIZE]],
            "pagination": {
                "page": page,
                "page_size": PAGE_SIZE,
                "total_pages": pages if total else 0,
                "total_reviews": total,
            },
        })

    def post(self, request, pk):
        product = _published_product(pk)
        user = _signed_in_user(request)
        if user is None:
            return Response({"detail": "Sign in to review this product."}, status=401)
        payload, error = _review_payload(request.data)
        if error:
            return Response({"detail": error}, status=400)
        payload["verified_purchaser"] = _verified_purchaser(user, product)
        existing = Review.objects.filter(product=product, author=user).select_related("author", "author__profile").first()
        if existing:
            return Response({
                "detail": "You already reviewed this product.",
                "review": _serialize_review(existing, request),
            }, status=409)
        review = Review.objects.create(
            product=product,
            author=user,
            status="pending",
            **payload,
        )
        review.author = user
        return Response(_serialize_review(review, request), status=201)


class MyProductReviewView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, pk):
        product = _published_product(pk)
        user = _signed_in_user(request)
        if user is None:
            return Response({"has_reviewed": False, "review": None})
        review = Review.objects.filter(product=product, author=user).select_related("author", "author__profile").first()
        return Response({
            "has_reviewed": review is not None,
            "verified_purchaser": _verified_purchaser(user, product),
            "review": _serialize_review(review, request) if review else None,
        })
