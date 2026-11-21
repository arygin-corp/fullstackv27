"""Calculated system badges. Editors Choice and Staff Pick stay manual."""

from datetime import timedelta

from django.db import ProgrammingError, transaction
from django.db.models import CharField, Count, Q, Value
from django.db.models.functions import Cast, Coalesce, NullIf
from django.db.utils import OperationalError
from django.utils import timezone

from apps.orders.models import Request, UserActivity

from .models import Badge, EndToEndSolutionProduct, Product, ProductDetailVisit, Review

COUNT_OVER = 100
QUALIFIED_VIEW_SECONDS = 5
NEW_ARRIVAL_DAYS = 60
TRENDING_DAYS = 30
MANUAL_SYSTEM_KEYS = {"editors_choice", "staff_pick"}
YES = "yes"

_syncing = False


def sync_calculated_badges(include_associations=False):
    global _syncing
    if _syncing:
        return
    _syncing = True
    try:
        if include_associations:
            share_end_to_end_associations()
        _apply(calculated_product_ids())
    except (OperationalError, ProgrammingError):
        return
    finally:
        _syncing = False


def record_qualified_view(product, request, duration_seconds):
    try:
        seconds = int(duration_seconds)
    except (TypeError, ValueError):
        return False
    if seconds < QUALIFIED_VIEW_SECONDS:
        return False
    visitor = ""
    user = getattr(request, "user", None)
    if user is not None and getattr(user, "is_authenticated", False):
        visitor = str(user.pk)
    ProductDetailVisit.objects.create(
        product=product,
        visitor=visitor[:255],
        duration_seconds=min(seconds, 86400),
    )
    sync_calculated_badges()
    return True


_applying_end_to_end = False


def end_to_end_apply_in_progress():
    return _applying_end_to_end


def propagate_end_to_end(ordered_ids):
    """Copy one ordered solution onto every product in that solution.

    The first id is the product being edited. The remaining ids are its
    solution products, already in display order. Each member then shows the
    same sequence with itself removed, so the solution does not have to be
    entered again on the other products.
    """
    global _applying_end_to_end
    if _applying_end_to_end:
        return
    ordered = []
    for product_id in ordered_ids:
        if product_id and product_id not in ordered:
            ordered.append(product_id)
    ordered = ordered[:16]
    if not ordered:
        return
    _applying_end_to_end = True
    try:
        with transaction.atomic():
            scope = _connected_solution_ids(ordered)
            desired = ordered if len(ordered) > 1 else []
            desired_ids = set(desired)
            for product_id in scope:
                if product_id in desired_ids:
                    _write_solution_links(
                        product_id,
                        [other for other in desired if other != product_id],
                    )
                else:
                    EndToEndSolutionProduct.objects.filter(
                        product_id=product_id,
                        solution_product_id__in=scope,
                    ).delete()
    finally:
        _applying_end_to_end = False


def share_end_to_end_associations():
    """Saved solutions are propagated when their rows are saved."""
    return None


def _connected_solution_ids(seed_ids):
    seen = set()
    stack = [product_id for product_id in seed_ids if product_id]
    while stack:
        current = stack.pop()
        if current in seen:
            continue
        seen.add(current)
        stack.extend(
            EndToEndSolutionProduct.objects.filter(product_id=current)
            .values_list("solution_product_id", flat=True)
        )
        stack.extend(
            EndToEndSolutionProduct.objects.filter(solution_product_id=current)
            .values_list("product_id", flat=True)
        )
    return seen


def _write_solution_links(product_id, others):
    others = [other for other in others if other and other != product_id][:15]
    keep = set(others)
    EndToEndSolutionProduct.objects.filter(product_id=product_id).exclude(
        solution_product_id__in=keep or [-1]
    ).delete()
    rows = list(EndToEndSolutionProduct.objects.filter(product_id=product_id))
    by_target = {row.solution_product_id: row for row in rows}
    for index, row in enumerate(rows):
        EndToEndSolutionProduct.objects.filter(pk=row.pk).update(position=200 + index)
    for position, other in enumerate(others, start=1):
        row = by_target.get(other)
        if row is None:
            EndToEndSolutionProduct.objects.create(
                product_id=product_id,
                solution_product_id=other,
                position=position,
            )
        else:
            EndToEndSolutionProduct.objects.filter(pk=row.pk).update(position=position)


def calculated_product_ids():
    yes = Q(pi__iexact=YES)
    spi = Q(sensitive_pi__iexact=YES)
    published_since = timezone.now() - timedelta(days=NEW_ARRIVAL_DAYS)
    return {
        "sensitive": set(Product.objects.filter(name__icontains="sensitive").values_list("id", flat=True)),
        "pi": set(Product.objects.filter(yes).exclude(spi).values_list("id", flat=True)),
        "spi": set(Product.objects.filter(spi).exclude(yes).values_list("id", flat=True)),
        "pi-spi": set(Product.objects.filter(yes, spi).values_list("id", flat=True)),
        "express_delivery": set(
            Product.objects.filter(
                Q(classification__name__iexact="Public")
                | Q(classification__name__iexact="Protected")
                | Q(classification__name__iexact="Protect")
            ).values_list("id", flat=True)
        ),
        "new_arrival": set(
            Product.objects.filter(is_active=True, status="approved").filter(
                Q(approved_at__gte=published_since)
                | Q(approved_at__isnull=True, created_at__gte=published_since)
            ).values_list("id", flat=True)
        ),
        "bundle_offer": _bundle_product_ids(),
        "most_requested": _ids_over(_request_counts(), COUNT_OVER),
        "most_reviewed": _ids_over(_review_counts(recommended=False), COUNT_OVER),
        "highly_recommended": _ids_over(_review_counts(recommended=True), COUNT_OVER),
        "employee_favorite": _ids_over(_favorite_counts(), COUNT_OVER),
        "most_viewed": _ids_over(_view_counts(), COUNT_OVER),
        "trending_product": _ids_over(_view_counts(since=timezone.now() - timedelta(days=TRENDING_DAYS)), COUNT_OVER),
    }


def _bundle_product_ids():
    rows = EndToEndSolutionProduct.objects.values_list("product_id", "solution_product_id")
    ids = set()
    for left, right in rows:
        if left:
            ids.add(left)
        if right:
            ids.add(right)
    return ids


def _ids_over(counts, minimum):
    return {product_id for product_id, total in counts.items() if total > minimum}


def _request_counts():
    totals = (
        Request.objects.exclude(Q(product_id__isnull=True) | Q(product_id=""))
        .values("product_id")
        .annotate(total=Count("id"))
    )
    by_id = {}
    by_slug = {}
    for row in totals:
        key = str(row["product_id"]).strip()
        if key.isdigit():
            by_id[int(key)] = row["total"]
        elif key:
            by_slug[key] = row["total"]
    counts = {}
    if not by_id and not by_slug:
        return counts
    products = Product.objects.filter(Q(id__in=by_id) | Q(slug__in=by_slug)).only("id", "slug")
    for product in products:
        counts[product.id] = by_id.get(product.id, 0) + by_slug.get(product.slug or "", 0)
    return counts


def _review_counts(recommended):
    reviews = Review.objects.filter(status="approved")
    if recommended:
        reviews = reviews.filter(would_recommend=True)
    rows = reviews.values("product_id").annotate(total=Count("id"))
    return {row["product_id"]: row["total"] for row in rows}


def _favorite_counts():
    rows = (
        UserActivity.objects.filter(action="favorite_add")
        .exclude(reference="")
        .annotate(person=Cast(
            Coalesce(NullIf("object_id", Value("")), NullIf("email", Value(""))),
            output_field=CharField(),
        ))
        .exclude(person__isnull=True)
        .values("reference")
        .annotate(total=Count("person", distinct=True))
    )
    by_id = {}
    by_slug = {}
    for row in rows:
        key = str(row["reference"]).strip()
        if key.isdigit():
            by_id[int(key)] = row["total"]
        elif key:
            by_slug[key] = row["total"]
    counts = {}
    if not by_id and not by_slug:
        return counts
    products = Product.objects.filter(Q(id__in=by_id) | Q(slug__in=by_slug)).only("id", "slug")
    for product in products:
        counts[product.id] = by_id.get(product.id, 0) + by_slug.get(product.slug or "", 0)
    return counts


def _view_counts(since=None):
    visits = ProductDetailVisit.objects.filter(duration_seconds__gte=QUALIFIED_VIEW_SECONDS)
    if since is not None:
        visits = visits.filter(created_at__gte=since)
    rows = visits.values("product_id").annotate(total=Count("id"))
    return {row["product_id"]: row["total"] for row in rows}


def _apply(assignments):
    badges = {
        badge.system_key: badge
        for badge in Badge.objects.filter(is_system=True).exclude(system_key__in=MANUAL_SYSTEM_KEYS)
    }
    through = Product.badge.through
    for key, badge in badges.items():
        desired = assignments.get(key) or set()
        current = set(through.objects.filter(badge_id=badge.id).values_list("product_id", flat=True))
        remove = current - desired
        add = desired - current
        if remove:
            through.objects.filter(badge_id=badge.id, product_id__in=remove).delete()
        if add:
            through.objects.bulk_create(
                [through(product_id=product_id, badge_id=badge.id) for product_id in add],
                ignore_conflicts=True,
            )
