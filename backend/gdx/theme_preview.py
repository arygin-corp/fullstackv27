"""Read-only snapshot for the theme test pages. No writes, no personal contact fields."""

import time

from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import Lower
from django.http import JsonResponse

_PLACEHOLDER_IMAGES = {"", "default.gif", "default.jpg", "default.png", "default.svg"}
_PAYLOAD_CACHE = {}
_PAYLOAD_TTL = 45
_REQUEST_FIELDS = (
    "id",
    "number",
    "ritm_number",
    "product_id",
    "requested_for",
    "opened_by",
    "approval_stage",
    "opened_at",
)


def _recall(key):
    hit = _PAYLOAD_CACHE.get(key)
    if hit and time.monotonic() - hit[0] < _PAYLOAD_TTL:
        return hit[1]
    return None


def _remember(key, payload):
    _PAYLOAD_CACHE[key] = (time.monotonic(), payload)
    return payload


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


def signed_in_profile(request):
    """Identity of the signed-in user, for the theme shell and profile screens."""
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return JsonResponse({"detail": "Authentication required."}, status=401)

    first = (getattr(user, "first_name", "") or "").strip()
    last = (getattr(user, "last_name", "") or "").strip()
    username = user.get_username()
    display = f"{first} {last}".strip() or username
    initials = (first[:1] + last[:1]).upper() or (username[:1] or "?").upper()

    job_title = ""
    department = ""
    phone = ""
    location = ""
    avatar_url = ""
    try:
        profile = user.profile
    except Exception:
        profile = None
    if profile is not None:
        job_title = (getattr(profile, "job_title", "") or "").strip()
        department = (getattr(profile, "department", "") or "").strip()
        phone = (getattr(profile, "phone", "") or "").strip()
        city = (getattr(profile, "city", "") or "").strip()
        state = (getattr(profile, "state", "") or "").strip()
        location = ", ".join(part for part in (city, state) if part)
        photo = getattr(profile, "image", None)
        photo_name = (getattr(photo, "name", "") or "").rsplit("/", 1)[-1].lower()
        if photo_name not in _PLACEHOLDER_IMAGES:
            try:
                avatar_url = request.build_absolute_uri(photo.url)
            except Exception:
                avatar_url = ""

    from apps.profiles.models import ACCESS_CHOICES, access_type_for

    role = dict(ACCESS_CHOICES).get(access_type_for(user), "")
    return JsonResponse({
        "firstName": first,
        "lastName": last,
        "displayName": display,
        "email": (getattr(user, "email", "") or "").strip(),
        "username": username,
        "jobTitle": job_title or role,
        "department": department,
        "phone": phone,
        "location": location,
        "initials": initials,
        "avatarUrl": avatar_url,
        "role": role,
    })


def _score_band(rate: int) -> str:
    if rate >= 100:
        return "Ahead"
    if rate >= 85:
        return "On track"
    return "Watch"


def _pct(part: int, whole: int) -> int:
    if whole <= 0:
        return 0
    return max(0, min(100, round(100 * part / whole)))


def _safe_count(queryset) -> int:
    from django.db.utils import DatabaseError, OperationalError, ProgrammingError

    try:
        return queryset.count()
    except (DatabaseError, OperationalError, ProgrammingError):
        return 0


def _published_trend():
    """Monthly published products for the current year.

    A product counts as new when it was created and approved in the same month.
    Anything approved later counts as backlog, which is the earlier catalog.
    """
    import calendar
    from collections import defaultdict

    from django.utils import timezone

    from apps.marketplace.models import Product

    now = timezone.localtime()
    year = now.year
    new_counts = defaultdict(int)
    backlog_counts = defaultdict(int)
    baseline = 0
    for approved_at, created_at in Product.objects.filter(status__iexact="approved").values_list("approved_at", "created_at"):
        if approved_at is None or approved_at.year < year:
            baseline += 1
            continue
        key = (approved_at.year, approved_at.month)
        same_month = (
            created_at is not None
            and created_at.year == approved_at.year
            and created_at.month == approved_at.month
        )
        if same_month:
            new_counts[key] += 1
        else:
            backlog_counts[key] += 1

    points = []
    running = baseline
    latest_new = None
    for month in range(1, now.month + 1):
        key = (year, month)
        published_new = new_counts[key]
        backlog = backlog_counts[key]
        running += published_new + backlog
        points.append({
            "month": calendar.month_abbr[month],
            "newProducts": published_new,
            "backlog": backlog,
            "catalog": running,
        })
        if published_new:
            latest_new = (month, published_new)
    peak_backlog = max(backlog_counts.items(), key=lambda item: item[1], default=((year, 2), 0))
    if latest_new:
        headline_label = f"New in {calendar.month_name[latest_new[0]]}"
        headline_value = f"{latest_new[1]:,}"
        note = f"{calendar.month_name[latest_new[0]]} added {latest_new[1]:,} products created and published in the same month."
        if peak_backlog[1]:
            note += (
                f" {calendar.month_name[peak_backlog[0][1]]} published {peak_backlog[1]:,} products"
                " that were already in the catalog."
            )
    else:
        headline_label = "New products"
        headline_value = "0"
        note = "No products were created and published in the same month this year."
    return {
        "publishedSeries": points,
        "publishedLabel": headline_label,
        "publishedValue": headline_value,
        "publishedNote": note,
    }


def _build_confidence():
    """Success, failure, and the latest result from recorded deployment builds."""
    from gdx.deployment import TARGETS, deployment_analytics, deployment_status

    counts = deployment_analytics()["counts"]
    status = deployment_status()
    succeeded = int(counts.get("succeeded") or 0)
    failed = int(counts.get("failed") or 0)
    running = int(counts.get("running") or 0)
    total = int(counts.get("total") or 0)
    finished = succeeded + failed
    mix = succeeded + failed + running
    success_share = _pct(succeeded, mix)
    failed_share = _pct(failed, mix)
    running_share = _pct(running, mix)
    if mix:
        success_share += 100 - (success_share + failed_share + running_share)
    rate = _pct(succeeded, finished)
    if not mix:
        band = "No builds"
    elif rate >= 90:
        band = "Strong"
    elif rate >= 70:
        band = "Steady"
    else:
        band = "Watch"
    target = TARGETS.get(status.get("target"), "") or "Build"
    environment = str(status.get("environment") or "").strip()
    where = target + (f" · {environment}" if environment else "")
    state = str(status.get("state") or "idle")
    state_label = {"succeeded": "Succeeded", "failed": "Failed", "running": "Running", "idle": "Idle"}.get(state, state.title())
    if state == "succeeded":
        latest = f"{where} finished cleanly."
    elif state == "failed":
        latest = f"{where} failed before it finished."
    elif state == "running":
        latest = f"{where} is running."
    else:
        latest = str(status.get("message") or "No build has been started.")
    recorded = finished or total
    return {
        "buildSucceeded": succeeded,
        "buildFailed": failed,
        "buildRunning": running,
        "buildTotal": total,
        "buildSuccessRate": rate,
        "buildSucceededShare": max(success_share, 0),
        "buildFailedShare": failed_share,
        "buildRunningShare": running_share,
        "buildBand": band,
        "buildLatestLabel": state_label,
        "buildLatestDetail": latest,
        "buildRateDetail": (
            f"{succeeded:,} of {recorded:,} recorded builds finished cleanly."
            if recorded
            else "No deployment builds have been recorded."
        ),
        "buildFailedDetail": (
            f"{failed:,} of {total:,} recorded builds failed."
            if total
            else "No failed builds are recorded."
        ),
    }


def _order_contribution():
    """Every marketplace request, grouped by the catalog domain it was placed against."""
    from collections import Counter

    from apps.marketplace.models import Product
    from apps.orders.models import Request

    from django.db.models import Count, Q

    grouped = Request.objects.values("product_id").annotate(
        placed=Count("id"),
        approved=Count("id", filter=Q(approval_stage__iexact="approved")),
    )
    total = 0
    numeric_ids = set()
    for row in grouped:
        total += row["placed"]
        text = str(row["product_id"] or "").strip()
        if text.isdigit() and text != "0":
            numeric_ids.add(int(text))
    domain_by_id = {
        str(pk): (name or "Unassigned")
        for pk, name in Product.objects.filter(id__in=numeric_ids).values_list("id", "domain__name")
    }
    placed = Counter()
    approved = Counter()
    linked = 0
    for row in grouped:
        text = str(row["product_id"] or "").strip()
        domain = domain_by_id.get(text)
        if domain:
            label = domain
            linked += row["placed"]
        elif text in {"", "0"}:
            label = "No product"
        else:
            label = "Unlisted product"
        placed[label] += row["placed"]
        approved[label] += row["approved"]
    ranked = placed.most_common()
    keep = {name for name, _count in ranked[:5]}
    points = [
        {"name": name, "placed": count, "approved": approved[name]}
        for name, count in ranked
        if name in keep
    ]
    other_names = [name for name, _count in ranked if name not in keep]
    if other_names:
        points.append({
            "name": "Other domains",
            "placed": sum(placed[name] for name in other_names),
            "approved": sum(approved[name] for name in other_names),
        })
    largest = points[0] if points else {"name": "None", "placed": 0}
    return {
        "orderRows": points,
        "orderTotal": total,
        "orderLinked": linked,
        "orderLinkedShare": _pct(linked, total),
        "orderLargest": largest["name"],
        "orderLargestShare": _pct(largest["placed"], total),
    }


def _release_groups(html: str):
    import re

    from django.utils.html import strip_tags

    parts = re.split(r"<strong>(.*?)</strong>", html or "", flags=re.I)
    groups = []
    for index in range(1, len(parts), 2):
        heading = " ".join(strip_tags(parts[index]).split())
        body = parts[index + 1] if index + 1 < len(parts) else ""
        items = []
        for raw in re.findall(r"<li[^>]*>(.*?)</li>", body, flags=re.I | re.S):
            item = " ".join(strip_tags(raw).split())
            if item:
                items.append(item)
        if heading or items:
            groups.append({"heading": heading, "items": items})
    return groups


def _listed(items, limit=2) -> str:
    shown = [item for item in items if item][:limit]
    if not shown:
        return ""
    if len(shown) == 1:
        text = shown[0]
    else:
        text = f"{shown[0]} and {shown[1]}"
    extra = len(items) - len(shown)
    if extra > 0:
        text += f", plus {extra} more"
    return text


def _marketplace_briefing():
    """Three review lines from the latest published data-marketplace release."""
    from apps.changelog.models import Post

    post = Post.objects.filter(status__iexact="published").order_by("-release_date", "-id").first()
    if post is None:
        return {
            "briefingWhen": "No release",
            "briefingNote": "No published data marketplace release is on record.",
            "briefingImproved": "No published marketplace update is on record yet.",
            "briefingAttention": "The next marketplace release has not been published.",
            "briefingNext": "Publish the next data marketplace release notes.",
        }
    groups = []
    for key in "ABCDEFGHIJ":
        groups.extend(_release_groups(getattr(post, f"post{key}", "") or ""))
    added = [group for group in groups if group["heading"].lower().startswith("new") and "update" not in group["heading"].lower()]
    attention = [
        group for group in groups
        if "dataset" not in group["heading"].lower()
        and any(word in group["heading"].lower() for word in ("update", "remove", "issue", "fix", "contact"))
    ]
    added_items = [item for group in added for item in group["items"]]
    released = post.release_date
    when = f"{released.strftime('%b')} {released.day}" if released else post.version
    if added_items:
        improved = f"Release {post.version} on {when} added {added_items[0]}."
    else:
        improved = f"Release {post.version} on {when} was published as {post.get_title_display()}."
    dataset_groups = [group for group in groups if "dataset" in group["heading"].lower()]
    dataset_items = [item for group in dataset_groups for item in group["items"]]
    if dataset_items:
        improved += f" It refreshed {len(dataset_items)} datasets, including {_listed(dataset_items)}."
    if attention:
        focus = attention[0]
        count = len(focus["items"])
        detail = _listed(focus["items"])
        if "contact" in focus["heading"].lower():
            attention_text = f"Point of contact changed on {count} APIs in that release, including {detail}."
        elif focus["items"]:
            attention_text = f"{focus['heading']} covers {count} items, including {detail}."
        else:
            attention_text = focus["heading"]
    else:
        attention_text = f"Release {post.version} records no removals or open issues."
    if added_items:
        next_step = f"Review {added_items[0]} and the other {post.version} catalog updates."
    else:
        next_step = f"Review the {post.version} notes in the data marketplace changelog."
    return {
        "briefingWhen": post.version,
        "briefingNote": f"From data marketplace release {post.version}, published {when}.",
        "briefingImproved": improved,
        "briefingAttention": attention_text,
        "briefingNext": next_step,
    }


def _operating_lens(year, published, builds, requests_total, requests_approved, requests_pending, decision_rate, latest_release):
    """Three operating signals from this year's marketplace activity and the running app."""
    points = published.get("publishedSeries") or []
    new_total = sum(int(point.get("newProducts") or 0) for point in points)
    backlog_total = sum(int(point.get("backlog") or 0) for point in points)
    catalog_note = published.get("publishedNote") or f"{year} has no newly published products on record."
    if backlog_total and "already in the catalog" not in catalog_note:
        catalog_note += f" {backlog_total:,} earlier catalog products were also published this year."
    release = (latest_release or "unpublished").split("·")[0].strip()
    build_detail = builds.get("buildLatestDetail") or "No deployment build has been recorded."
    build_rate = builds.get("buildRateDetail") or ""
    system = f"The data marketplace app is running release {release}. {build_detail}"
    if build_rate:
        system += f" {build_rate}"
    return {
        "lensBadge": str(year),
        "lensNote": f"Three signals from {year} marketplace activity and the app that is running it.",
        "lensMark": "Marketplace app",
        "lens": [
            {
                "title": "Published products",
                "body": catalog_note,
                "mark": f"{new_total:,} new in {year}",
            },
            {
                "title": "Request decisions",
                "body": (
                    f"{year} has {requests_total:,} marketplace requests. "
                    f"{requests_approved:,} are approved and {requests_pending:,} are still open."
                ),
                "mark": f"{decision_rate}% decided",
            },
            {
                "title": "Marketplace app",
                "body": system,
                "mark": f"Release {release}",
            },
        ],
    }


def _system_risks(requests_pending, products_total, approved, pending_products):
    """Backend services whose latest result still needs mediation."""
    from gdx.deployment import ENVIRONMENT_LABELS, TARGETS, deployment_history

    latest = {}
    failures = {}
    for item in deployment_history():
        key = (item.get("target"), item.get("environment"))
        latest[key] = item
        if item.get("state") == "failed":
            failures[key] = failures.get(key, 0) + 1
    risks = []
    for key, item in latest.items():
        if item.get("state") != "failed":
            continue
        service = TARGETS.get(key[0], "Build")
        environment = ENVIRONMENT_LABELS.get(key[1], key[1] or "unknown")
        count = failures.get(key, 1)
        risks.append({
            "title": f"{service} · {environment}",
            "level": "High",
            "tone": "high",
            "detail": f"{count} {environment} build{'s' if count != 1 else ''} failed, and the latest one has not been cleared.",
            "owner": "Deployment",
        })
    if requests_pending:
        risks.append({
            "title": "Access approvals",
            "level": "High",
            "tone": "high",
            "detail": f"{requests_pending:,} marketplace requests are still waiting on an approval.",
            "owner": "Access",
        })
    unpublished = max(products_total - approved, 0)
    if unpublished:
        pending_note = f", including {pending_products:,} still pending" if pending_products else ""
        risks.append({
            "title": "Catalog approval",
            "level": "Medium",
            "tone": "medium",
            "detail": f"{unpublished:,} catalog products are not approved{pending_note}.",
            "owner": "Catalog",
        })
    risks.sort(key=lambda item: (item["tone"] != "high", item["title"]))
    count = len(risks)
    return {
        "systemRisks": risks[:3],
        "systemRiskCount": count,
        "systemRiskNote": "Open risks across backend services that still need mediation.",
        "systemRiskAction": f"{count} to mediate" if count else "None open",
    }


def _roadmap_initiatives():
    """The current fiscal window from the GDX Data Marketplace roadmap."""
    from datetime import date

    from django.utils import timezone

    from apps.third_party_apis.modules.roadmap.models import RoadmapMilestone, RoadmapPage

    today = timezone.localdate()
    if today.month >= 4:
        fiscal = today.year
        current = (today.month - 4) // 3 + 1
    else:
        fiscal = today.year - 1
        current = 4
    bounds = {
        1: (date(fiscal, 4, 1), date(fiscal, 6, 30)),
        2: (date(fiscal, 7, 1), date(fiscal, 9, 30)),
        3: (date(fiscal, 10, 1), date(fiscal, 12, 31)),
        4: (date(fiscal + 1, 1, 1), date(fiscal + 1, 3, 31)),
    }
    if current <= 1:
        window = [1, 2, 3]
    elif current >= 4:
        window = [2, 3, 4]
    else:
        window = [current - 1, current, current + 1]
    milestones = {
        item.quarter: item
        for item in RoadmapMilestone.objects.filter(is_active=True, fiscal_start_year=fiscal, quarter__in=window)
    }
    items = []
    for quarter in window:
        milestone = milestones.get(quarter)
        if milestone is None:
            continue
        start, end = bounds[quarter]
        if quarter < current:
            progress, state, tone = 100, "Delivered", "delivered"
        elif quarter > current:
            progress, state, tone = 0, "Planned", "planned"
        else:
            span = (end - start).days + 1
            elapsed = (today - start).days + 1
            progress = max(0, min(100, round(elapsed * 100 / span)))
            state, tone = "In progress", "active"
        items.append({
            "title": milestone.title,
            "state": state,
            "tone": tone,
            "owner": f"FY{fiscal} · {milestone.month_name}",
            "progress": progress,
            "detail": milestone.description or f"{milestone.month_name} milestone on the product roadmap.",
        })
    page = RoadmapPage.objects.filter(is_active=True).order_by("id").first()
    note = page.description if page else "Milestones from the GDX Data Marketplace roadmap."
    return {
        "roadmap": items,
        "roadmapBadge": f"FY{fiscal}",
        "roadmapNote": note,
    }


def _approval_queue(limit=3):
    """Latest marketplace requests that still need an approval."""
    from django.db.models import F
    from django.utils import timezone

    from apps.marketplace.models import Product
    from apps.orders.models import Request

    waiting = Request.objects.annotate(stage_key=Lower("approval_stage")).filter(
        stage_key__in=["requested", "not yet requested"]
    )
    total = _safe_count(waiting)
    rows = list(waiting.order_by(F("opened_at").desc(nulls_last=True), "-id")[:limit])
    product_ids = []
    for row in rows:
        text = str(row.product_id or "").strip()
        if text.isdigit() and text not in {"0", "999999999"}:
            product_ids.append(int(text))
    names = {
        str(pk): name
        for pk, name in Product.objects.filter(id__in=product_ids).values_list("id", "name")
        if name
    }
    items = []
    for row in rows:
        text = str(row.product_id or "").strip()
        if text in {"", "0"}:
            product = "No product"
        else:
            product = names.get(text) or "Unlisted product"
        number = (row.number or row.ritm_number or f"Request {row.id}").strip()
        person = (row.requested_for or row.opened_by or "Unassigned").strip()
        stage = (row.approval_stage or "Requested").strip()
        when = ""
        if row.opened_at:
            local = timezone.localtime(row.opened_at)
            hour = local.strftime("%I").lstrip("0") or "12"
            when = f"{local.strftime('%b')} {local.day} · {hour}:{local.strftime('%M %p')}"
        items.append({
            "title": f"Approve {number}",
            "stage": stage,
            "tone": "waiting" if stage.lower() == "requested" else "queued",
            "detail": " · ".join(part for part in (person, product, when) if part),
        })
    return {
        "approvalQueue": items,
        "approvalDue": total,
        "approvalDueLabel": f"{total} due" if total else "None due",
        "approvalNote": "Latest marketplace requests waiting on an approval.",
    }


def _request_stage_counts():
    """One pass over access requests instead of a separate count for every stage."""
    from datetime import timedelta

    from django.db.models import Count, Q
    from django.utils import timezone

    from apps.orders.models import Request

    now = timezone.now()
    month = now - timedelta(days=30)
    prior = now - timedelta(days=60)
    return Request.objects.aggregate(
        total=Count("id"),
        requested=Count("id", filter=Q(approval_stage__iexact="requested")),
        not_yet=Count("id", filter=Q(approval_stage__iexact="not yet requested")),
        pending=Count("id", filter=Q(approval_stage__iexact="requested") | Q(approval_stage__iexact="not yet requested")),
        approved=Count("id", filter=Q(approval_stage__iexact="approved")),
        rejected=Count("id", filter=Q(approval_stage__iexact="rejected")),
        recent=Count("id", filter=Q(opened_at__gte=month)),
        prior=Count("id", filter=Q(opened_at__gte=prior, opened_at__lt=month)),
    )


def _marketplace_kpis():
    """Marketplace operating numbers shared by the executive and command center cards."""
    cached = _recall("kpis")
    if cached is not None:
        return cached
    from django.db.models import Q
    from django.utils import timezone

    products_total = approved = pending_products = 0
    requests_total = requests_pending = requests_approved = requests_rejected = requests_recent = requests_prior = 0
    domains = teams = reviews = releases = releases_published = 0
    orders_total = orders_synced = 0
    latest_release = ""
    try:
        from apps.marketplace.models import Domain, Product, Review

        product_counts = Product.objects.aggregate(
            total=Count("id"),
            approved=Count("id", filter=Q(status__iexact="approved")),
            pending=Count("id", filter=Q(status="pending")),
        )
        products_total = product_counts["total"] or 0
        approved = product_counts["approved"] or 0
        pending_products = product_counts["pending"] or 0
        domains = _safe_count(Domain.objects.all())
        reviews = _safe_count(Review.objects.all())
    except Exception:
        products_total = approved = pending_products = domains = reviews = 0
    try:
        from apps.teams.models import Team

        teams = _safe_count(Team.objects.all())
    except Exception:
        teams = 0
    try:
        from apps.orders.models import MarketplaceOrder

        stages = _request_stage_counts()
        requests_total = stages["total"] or 0
        requests_pending = stages["pending"] or 0
        requests_approved = stages["approved"] or 0
        requests_rejected = stages["rejected"] or 0
        requests_recent = stages["recent"] or 0
        requests_prior = stages["prior"] or 0
        orders = MarketplaceOrder.objects.all()
        orders_total = _safe_count(orders)
        orders_synced = _safe_count(orders.filter(sync_status=MarketplaceOrder.SyncStatus.SYNCHRONIZED))
    except Exception:
        requests_total = requests_pending = requests_approved = requests_rejected = requests_recent = requests_prior = 0
        orders_total = orders_synced = 0
    try:
        from apps.changelog.models import Post

        releases = _safe_count(Post.objects.all())
        published = Post.objects.filter(status__iexact="published").order_by("-release_date")
        releases_published = _safe_count(published)
        latest = published.only("version", "release_date").first()
        if latest is not None:
            released = _when(latest.release_date)
            latest_release = f"{latest.version}" + (f" · {released}" if released else "")
    except Exception:
        releases = releases_published = 0
        latest_release = ""

    approval = _pct(approved, products_total)
    request_approval = _pct(requests_approved, requests_total)
    decision_rate = _pct(requests_approved + requests_rejected, requests_total)
    release_share = _pct(releases_published, releases)
    sync_share = _pct(orders_synced, orders_total)
    try:
        builds = _build_confidence()
    except Exception:
        builds = {}
    try:
        orders = _order_contribution()
    except Exception:
        orders = {"orderRows": []}
    try:
        briefing = _marketplace_briefing()
    except Exception:
        briefing = {}
    try:
        published = _published_trend()
    except Exception:
        published = {
            "publishedSeries": [],
            "publishedLabel": "New products",
            "publishedValue": "0",
            "publishedNote": "",
        }
    try:
        approvals = _approval_queue()
    except Exception:
        approvals = {"approvalQueue": []}
    try:
        roadmap = _roadmap_initiatives()
    except Exception:
        roadmap = {"roadmap": []}
    try:
        risks = _system_risks(requests_pending, products_total, approved, pending_products)
    except Exception:
        risks = {"systemRisks": []}
    try:
        lens = _operating_lens(
            timezone.localtime().year,
            published,
            builds,
            requests_total,
            requests_approved,
            requests_pending,
            decision_rate,
            latest_release,
        )
    except Exception:
        lens = {}
    request_delta = requests_recent - requests_prior
    if request_delta > 0:
        request_change = f"+{request_delta}"
    elif request_delta < 0:
        request_change = str(request_delta)
    else:
        request_change = "0"
    build_rate = int(builds.get("buildSuccessRate") or 0)
    scorecard = [
        {
            "title": "Catalog approval",
            "detail": f"{approved:,} of {products_total:,} products are approved.",
            "value": approval,
            "band": _score_band(approval),
        },
        {
            "title": "Access decisions",
            "detail": f"{requests_pending:,} of {requests_total:,} requests are still open.",
            "value": decision_rate,
            "band": _score_band(decision_rate),
        },
        {
            "title": "Deployment builds",
            "detail": builds.get("buildRateDetail") or "No deployment builds have been recorded.",
            "value": build_rate,
            "band": _score_band(build_rate) if builds else "Watch",
        },
        {
            "title": "Published releases",
            "detail": f"{releases_published:,} of {releases:,} releases are published.",
            "value": release_share,
            "band": _score_band(release_share),
        },
    ]
    watching = sum(1 for item in scorecard if item["band"] == "Watch")
    return _remember("kpis", {
        "approvalRate": approval,
        "approvedProducts": approved,
        "products": products_total,
        "pendingProducts": pending_products,
        "domains": domains,
        "teams": teams,
        "reviews": reviews,
        "requests": requests_total,
        "requestsPending": requests_pending,
        "requestsApproved": requests_approved,
        "requestsRejected": requests_rejected,
        "decisionRate": decision_rate,
        "requestsRecent": requests_recent,
        "requestChange": request_change,
        "requestApprovalRate": request_approval,
        "releases": releases,
        "releasesPublished": releases_published,
        "releaseShare": release_share,
        "latestRelease": latest_release or "None published",
        "orders": orders_total,
        "ordersSynced": orders_synced,
        "syncShare": sync_share,
        **published,
        **builds,
        "scorecard": scorecard,
        "scorecardBadge": f"{watching} to watch" if watching else "On track",
        **orders,
        **briefing,
        **lens,
        **risks,
        **roadmap,
        **approvals,
    })


def executive_kpis(request):
    """Marketplace operating numbers for the executive hero card."""
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    return JsonResponse(_marketplace_kpis())


def _signed_in(request):
    user = getattr(request, "user", None)
    return user is not None and getattr(user, "is_authenticated", False)


def command_center(request):
    """Whole-application snapshot for superadmins and engineering."""
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    payload = _marketplace_kpis()
    modules = _command_modules()
    people = _safe_count_model("django.contrib.auth", "get_user_model")
    staff_pages = _staff_page_count()
    content_pages = _safe_count_model("apps.pages.models", "Page", is_deleted=False)
    registered = modules["registered"]
    ready = modules["ready"]
    enabled = modules["enabled"]
    readiness = _pct(ready, registered)
    enabled_share = _pct(enabled, registered)
    build_rate = int(payload.get("buildSuccessRate") or 0)
    scorecard = [
        {
            "title": "Module readiness",
            "detail": f"{ready:,} of {registered:,} registered modules are configured.",
            "value": readiness,
            "band": _score_band(readiness),
        },
        {
            "title": "Catalog approval",
            "detail": f"{payload.get('approvedProducts', 0):,} of {payload.get('products', 0):,} products are approved.",
            "value": payload.get("approvalRate") or 0,
            "band": _score_band(payload.get("approvalRate") or 0),
        },
        {
            "title": "Access decisions",
            "detail": f"{payload.get('requestsPending', 0):,} of {payload.get('requests', 0):,} requests are still open.",
            "value": payload.get("decisionRate") or 0,
            "band": _score_band(payload.get("decisionRate") or 0),
        },
        {
            "title": "Deployment builds",
            "detail": payload.get("buildRateDetail") or "No deployment builds have been recorded.",
            "value": build_rate,
            "band": _score_band(build_rate),
        },
    ]
    watching = sum(1 for item in scorecard if item["band"] == "Watch")
    release = str(payload.get("latestRelease") or "unpublished").split("·")[0].strip()
    unlinked = modules["unlinked"]
    incomplete = modules["incomplete"]
    orphans = modules["orphans"]
    risks = []
    if unlinked:
        names = ", ".join(unlinked[:3])
        extra = f", plus {len(unlinked) - 3} more" if len(unlinked) > 3 else ""
        risks.append({
            "title": "Modules not in the database",
            "level": "High",
            "tone": "high",
            "detail": f"{len(unlinked)} registered modules have no installation row: {names}{extra}.",
            "owner": "Engineering",
        })
    if incomplete:
        risks.append({
            "title": "Modules missing settings",
            "level": "Medium",
            "tone": "medium",
            "detail": f"{len(incomplete)} modules are missing required settings: {', '.join(incomplete)}.",
            "owner": "Engineering",
        })
    for row in payload.get("systemRisks") or []:
        if len(risks) >= 3:
            break
        risks.append(row)
    payload.update({
        "modulesRegistered": registered,
        "modulesEnabled": enabled,
        "modulesReady": ready,
        "modulesIncomplete": len(incomplete),
        "modulesUnlinked": len(unlinked),
        "people": people,
        "staffPages": staff_pages,
        "contentPages": content_pages,
        "readiness": readiness,
        "enabledShare": enabled_share,
        "headline": "The application is running. ",
        "accent": (
            f"{enabled:,} of {registered:,} modules are enabled, "
            f"with {payload.get('requestsPending', 0):,} requests still open."
        ),
        "scorecard": scorecard,
        "scorecardBadge": f"{watching} to watch" if watching else "On track",
        "scorecardTitle": "Application scorecard",
        "scorecardNote": "Modules, catalog, access requests, and deployment builds.",
        "lensBadge": "Live",
        "lensNote": "Modules, access, and the release engineering is running.",
        "lensTitle": "Application activity",
        "lensMark": "Whole application",
        "lens": [
            {
                "title": "Modules",
                "body": (
                    f"{registered:,} modules are registered and {enabled:,} are enabled. "
                    f"{ready:,} are configured. {len(unlinked):,} have no database row."
                ),
                "mark": f"{enabled:,} enabled",
            },
            {
                "title": "Access",
                "body": (
                    f"{payload.get('requests', 0):,} marketplace requests are on record. "
                    f"{payload.get('requestsApproved', 0):,} are approved and "
                    f"{payload.get('requestsPending', 0):,} are still open."
                ),
                "mark": f"{payload.get('decisionRate') or 0}% decided",
            },
            {
                "title": "Engineering",
                "body": (
                    f"Release {release} is published. "
                    f"{payload.get('buildRateDetail') or 'No deployment builds have been recorded.'} "
                    f"{people:,} people can sign in, across {staff_pages:,} staff pages."
                ),
                "mark": f"Release {release}",
            },
        ],
        "systemRisks": risks[:3],
        "systemRiskCount": len(risks),
        "systemRiskNote": "Open conditions across the application that still need mediation.",
        "systemRiskAction": f"{len(risks)} to mediate" if risks else "None open",
    })
    if orphans:
        payload["lens"][0]["body"] += f" {len(orphans):,} stored rows no longer match a registered module."
    return JsonResponse(payload)


def _command_modules():
    from apps.third_party_apis.models import InstalledThirdPartyApi
    from apps.third_party_apis.operational_status import ModuleOperationalStatus
    from apps.third_party_apis.registry import registry

    registry.autodiscover()
    installed = {row.module_key: row for row in InstalledThirdPartyApi.objects.all()}
    registered = list(registry.all())
    keys = {module.key for module in registered}
    incomplete = []
    ready = enabled = 0
    unlinked = []
    for module in registered:
        row = installed.get(module.key)
        if row is None:
            unlinked.append(getattr(module, "display_name", "") or module.key)
        elif row.enabled:
            enabled += 1
        missing = ModuleOperationalStatus(module).missing_required()
        if missing:
            incomplete.append(getattr(module, "display_name", "") or module.key)
        else:
            ready += 1
    orphans = sorted(
        (row.name or key)
        for key, row in installed.items()
        if key not in keys
    )
    return {
        "registered": len(registered),
        "enabled": enabled,
        "ready": ready,
        "incomplete": incomplete,
        "unlinked": unlinked,
        "orphans": orphans,
    }


def _safe_count_model(module_path, name, **filters):
    try:
        imported = __import__(module_path, fromlist=[name])
        model = getattr(imported, name)
        if callable(model) and name == "get_user_model":
            model = model()
        query = model.objects.all()
        if filters:
            query = query.filter(**filters)
        return _safe_count(query)
    except Exception:
        return 0


def _staff_page_count():
    try:
        from gdx.page_access import PAGES

        return len(PAGES)
    except Exception:
        return 0


def module_catalog(request):
    """Every registered module, for the modules dashboard."""
    user = getattr(request, "user", None)
    if user is None or not getattr(user, "is_authenticated", False):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from collections import Counter

    from apps.third_party_apis.models import InstalledThirdPartyApi
    from apps.third_party_apis.operational_status import ModuleOperationalStatus
    from apps.third_party_apis.registry import registry
    from gdx.removal import hidden_module_keys

    registry.autodiscover()
    installed = {row.module_key: row for row in InstalledThirdPartyApi.objects.all()}
    hidden = hidden_module_keys()
    modules = []
    for module in registry.all():
        if module.key in hidden:
            continue
        row = installed.get(module.key)
        ready = not ModuleOperationalStatus(module).missing_required()
        enabled = bool(row and row.enabled)
        if enabled and ready:
            state = "Enabled"
        elif not ready:
            state = "Needs setup"
        else:
            state = "Registered"
        name = ((row.name if row else "") or getattr(module, "display_name", "") or module.key).strip()
        source = (
            (row.source_name if row else "")
            or getattr(module, "default_source_name", "")
            or getattr(module, "owner", "")
            or "Unassigned"
        ).strip()
        modules.append({
            "name": name,
            "key": module.key,
            "source": source or "Unassigned",
            "enabled": enabled,
            "status": "Ready" if ready else "Incomplete",
            "state": state,
        })
    modules.sort(key=lambda item: item["name"].lower())
    owners = Counter(item["source"] for item in modules)
    return JsonResponse({
        "moduleTotal": len(modules),
        "moduleEnabled": sum(1 for item in modules if item["enabled"]),
        "moduleReady": sum(1 for item in modules if item["status"] == "Ready"),
        "moduleIncomplete": sum(1 for item in modules if item["status"] == "Incomplete"),
        "moduleOwners": [{"name": name, "count": count} for name, count in owners.most_common()],
        "modules": modules,
    })


def _product_image(product):
    for shot in product.images.all():
        image = shot.image
        name = getattr(image, "name", "") if image is not None else ""
        if not name or name in _PLACEHOLDER_IMAGES or name.endswith("/default.jpg"):
            continue
        try:
            return image.url
        except ValueError:
            continue
    return ""


def product_catalog(request):
    """Marketplace products for the theme product list."""
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    cached = _recall("products")
    if cached is not None:
        return JsonResponse(cached)
    from django.db.models import Prefetch

    from apps.marketplace.models import Domain, Product, ProductImage

    shots = ProductImage.objects.exclude(image="").exclude(image__isnull=True).order_by("position", "id")
    query = Product.objects.select_related("domain", "datatype", "classification").only(
        "id", "name", "sku", "price", "status",
        "domain", "domain__name",
        "datatype", "datatype__name",
        "classification", "classification__name",
    ).prefetch_related(
        Prefetch("images", queryset=shots)
    )
    total = _safe_count(query)
    approved = _safe_count(query.filter(status__iexact="approved"))
    active = _safe_count(query.filter(is_active=True))
    domains = _safe_count(Domain.objects.all())
    products = []
    for item in query.order_by("name", "id"):
        price = item.price if item.price is not None else 0
        products.append({
            "id": item.id,
            "name": (item.name or "").strip() or f"Product {item.id}",
            "sku": (item.sku or "").strip() or "—",
            "domain": item.domain.name if item.domain_id and item.domain else "Unassigned",
            "datatype": item.datatype.name if item.datatype_id and item.datatype else "—",
            "classification": item.classification.name if item.classification_id and item.classification else "—",
            "status": (item.status or "draft").strip() or "draft",
            "price": f"${price:,.2f}",
            "image": _product_image(item),
        })
    return JsonResponse(_remember("products", {
        "total": total,
        "approved": approved,
        "active": active,
        "domains": domains,
        "products": products,
    }))


def _shares(counts):
    total = sum(counts)
    if total <= 0:
        return [0 for _count in counts]
    raw = [int(round(count * 100 / total)) for count in counts]
    raw[-1] += 100 - sum(raw)
    return raw


def _short_label(name, limit=12):
    text = (name or "Unassigned").split("/")[0].strip() or "Unassigned"
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def commerce_dashboard(request):
    """Marketplace catalog and access-request numbers for the ecommerce dashboard."""
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    cached = _recall("commerce")
    if cached is not None:
        return JsonResponse(cached)

    import calendar
    from collections import Counter, defaultdict

    from django.utils import timezone

    from apps.marketplace.models import Product
    from apps.orders.models import Request, UserActivity

    base = _marketplace_kpis()
    products = Product.objects.select_related("domain", "datatype", "classification")
    status_rows = list(products.values("status").annotate(total=Count("id")))
    status_counts = {str(row["status"] or "draft").strip().lower(): row["total"] for row in status_rows}
    datatype_rows = list(
        products.values("datatype__name").annotate(total=Count("id")).order_by("-total", "datatype__name")
    )
    class_rows = list(
        products.values("classification__name").annotate(total=Count("id")).order_by("-total", "classification__name")
    )
    domain_rows = list(
        products.values("domain__name").annotate(total=Count("id")).order_by("-total", "domain__name")
    )

    from django.db.models import Q

    request_rows = list(
        Request.objects.values("product_id").annotate(
            placed=Count("id"),
            rejected=Count("id", filter=Q(approval_stage__iexact="rejected")),
        )
    )
    numeric_ids = set()
    for row in request_rows:
        text = str(row["product_id"] or "").strip()
        if text.isdigit() and text not in {"0", "999999999"}:
            numeric_ids.add(int(text))
    catalog = {
        item.id: item
        for item in products.filter(id__in=numeric_ids).prefetch_related("images")
    }
    demand = Counter()
    domain_requests = Counter()
    domain_rejected = Counter()
    for row in request_rows:
        text = str(row["product_id"] or "").strip()
        if not text.isdigit() or text in {"0", "999999999"}:
            continue
        item = catalog.get(int(text))
        if item is None:
            continue
        demand[item.id] += row["placed"]
        domain_name = item.domain.name if item.domain_id and item.domain else "Unassigned"
        domain_requests[domain_name] += row["placed"]
        domain_rejected[domain_name] += row["rejected"]

    domain_points = []
    for row in domain_rows:
        if not row["total"]:
            continue
        name = row["domain__name"] or "Unassigned"
        domain_points.append({
            "name": name,
            "short": _short_label(name),
            "products": row["total"],
            "requests": domain_requests[name],
            "rejected": domain_rejected[name],
        })
    domain_points.sort(key=lambda item: (-item["products"], item["name"]))
    domain_shares = _shares([item["products"] for item in domain_points])
    for item, share in zip(domain_points, domain_shares):
        item["share"] = share

    def _named(rows, key):
        points = []
        for row in rows:
            if not row["total"]:
                continue
            points.append({"name": row[key] or "Unassigned", "count": row["total"]})
        shares = _shares([item["count"] for item in points])
        for item, share in zip(points, shares):
            item["share"] = share
        return points

    stage_counts = [
        ("Approved", int(base.get("requestsApproved") or 0)),
        ("Rejected", int(base.get("requestsRejected") or 0)),
        ("Requested", int(base.get("requestsPending") or 0)),
        ("Other", max(int(base.get("requests") or 0) - int(base.get("requestsApproved") or 0) - int(base.get("requestsRejected") or 0) - int(base.get("requestsPending") or 0), 0)),
    ]
    stage_shares = _shares([count for _label, count in stage_counts])
    stages = [
        {"label": label, "value": count, "share": share}
        for (label, count), share in zip(stage_counts, stage_shares)
    ]

    now = timezone.localtime()
    created_counts = defaultdict(int)
    opened_counts = defaultdict(int)
    rejected_counts = defaultdict(int)
    for created_at in products.filter(created_at__year=now.year).values_list("created_at", flat=True):
        if created_at is not None:
            created_counts[timezone.localtime(created_at).month] += 1
    for opened_at, stage in Request.objects.filter(opened_at__year=now.year).values_list("opened_at", "approval_stage"):
        if opened_at is None:
            continue
        month = timezone.localtime(opened_at).month
        opened_counts[month] += 1
        if str(stage or "").strip().lower() == "rejected":
            rejected_counts[month] += 1
    months = [
        {
            "label": calendar.month_abbr[month],
            "products": created_counts[month],
            "requests": opened_counts[month],
            "rejected": rejected_counts[month],
        }
        for month in range(1, 13)
    ]

    ranked = demand.most_common(8)
    linked = sum(demand.values()) or 1
    top_products = []
    for product_id, count in ranked:
        item = catalog[product_id]
        top_products.append({
            "id": item.id,
            "name": (item.name or "").strip() or f"Product {item.id}",
            "sku": (item.sku or "").strip() or "—",
            "domain": item.domain.name if item.domain_id and item.domain else "Unassigned",
            "status": (item.status or "draft").strip() or "draft",
            "requests": count,
            "share": _pct(count, linked),
            "image": _product_image(item),
        })

    recent_ids = []
    recent_rows = list(
        Request.objects.exclude(opened_at=None).order_by("-opened_at", "-id").values(
            "ritm_number", "number", "approval_stage", "requested_for", "opened_by", "product_id", "opened_at"
        )[:12]
    )
    for row in recent_rows:
        text = str(row["product_id"] or "").strip()
        if text.isdigit() and text not in {"0", "999999999"}:
            recent_ids.append(int(text))
    recent_products = {
        item.id: item
        for item in Product.objects.filter(id__in=recent_ids).select_related("domain").prefetch_related("images")
    }
    recent = []
    for row in recent_rows:
        text = str(row["product_id"] or "").strip()
        item = recent_products.get(int(text)) if text.isdigit() and text not in {"0", "999999999"} else None
        person = (row["requested_for"] or row["opened_by"] or "").strip() or "Unassigned"
        number = (row["ritm_number"] or row["number"] or "").strip() or "—"
        recent.append({
            "number": number,
            "person": person,
            "product": (item.name or "").strip() if item is not None and item.name else "Unlisted product",
            "domain": item.domain.name if item is not None and item.domain_id and item.domain else "No catalog product",
            "stage": (row["approval_stage"] or "").strip() or "Open",
            "when": _when(row["opened_at"]),
            "image": _product_image(item) if item is not None else "",
        })

    activity = []
    for item in UserActivity.objects.order_by("-created_at", "-id")[:3]:
        activity.append({
            "title": (item.title or item.action or "Activity").strip(),
            "detail": (item.detail or "").strip(),
            "when": _when(item.created_at),
        })

    rejected_share = _pct(base.get("requestsRejected") or 0, base.get("requests") or 0)
    classifications = _named(class_rows, "classification__name")[:4]
    class_shares = _shares([item["count"] for item in classifications])
    for item, share in zip(classifications, class_shares):
        item["share"] = share
    payload = {
        "products": base.get("products") or 0,
        "approvedProducts": base.get("approvedProducts") or 0,
        "approvalRate": base.get("approvalRate") or 0,
        "pendingProducts": base.get("pendingProducts") or 0,
        "archivedProducts": status_counts.get("archived", 0),
        "domains": base.get("domains") or 0,
        "reviews": base.get("reviews") or 0,
        "requests": base.get("requests") or 0,
        "requestsPending": base.get("requestsPending") or 0,
        "requestsApproved": base.get("requestsApproved") or 0,
        "requestsRejected": base.get("requestsRejected") or 0,
        "decisionRate": base.get("decisionRate") or 0,
        "rejectedShare": rejected_share,
        "year": now.year,
        "datatypes": _named(datatype_rows, "datatype__name"),
        "classifications": classifications,
        "domainPoints": domain_points[:12],
        "months": months,
        "stages": stages,
        "topProducts": top_products,
        "recentRequests": recent,
        "activity": activity,
    }
    return JsonResponse(_remember("commerce", payload))


def product_approvals(request):
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from django.db.models import Prefetch
    from apps.marketplace.models import Product, ProductImage

    shots = ProductImage.objects.exclude(image="").exclude(image__isnull=True).order_by("position", "id")
    query = Product.objects.select_related("domain", "datatype").prefetch_related(
        Prefetch("images", queryset=shots)
    )
    approved = _safe_count(query.filter(status__iexact="approved"))
    archived = _safe_count(query.filter(status__iexact="archived"))
    review = query.filter(data_review_status="pending_review")
    drafts = query.filter(cwpg_status="draft")

    def row(item, queue, note):
        price = item.price if item.price is not None else 0
        return {
            "id": item.id,
            "name": (item.name or "Untitled product").strip(),
            "sku": (item.sku or "").strip() or f"PRD-{item.id}",
            "domain": item.domain.name if item.domain_id else "Unassigned",
            "datatype": item.datatype.name if item.datatype_id else "Unassigned",
            "status": (item.status or "draft").replace("_", " ").title(),
            "price": f"${price:,.2f}",
            "image": _product_image(item),
            "updated": _when(item.updated_at),
            "queue": queue,
            "note": note,
        }

    queue = [
        row(item, "Data review", "Waiting on the data review board.")
        for item in review.order_by("name", "id")
    ]
    queue.extend(
        row(item, "Content draft", "Content manager status is still draft.")
        for item in drafts.order_by("name", "id")
    )
    return JsonResponse({
        "waiting": _safe_count(review),
        "drafts": _safe_count(drafts),
        "archived": archived,
        "approved": approved,
        "queue": queue,
    })


def product_reviews(request):
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from django.db.models import Avg, Prefetch
    from apps.marketplace.models import ProductImage, Review

    shots = ProductImage.objects.exclude(image="").exclude(image__isnull=True).order_by("position", "id")
    reviews = (
        Review.objects.select_related("product", "author")
        .prefetch_related(Prefetch("product__images", queryset=shots))
        .order_by("-created_at", "-id")
    )
    total = _safe_count(reviews)
    average = reviews.aggregate(value=Avg("rating"))["value"]
    pending = _safe_count(reviews.filter(status="pending"))
    verified = _safe_count(reviews.filter(verified_purchaser=True))
    recommend = _safe_count(reviews.filter(would_recommend=True))
    rows = []
    for review in reviews[:100]:
        author = review.author
        name = " ".join(
            part for part in (getattr(author, "first_name", ""), getattr(author, "last_name", "")) if part
        ).strip() or author.get_username()
        product = review.product
        rows.append({
            "id": review.id,
            "productId": review.product_id,
            "product": (product.name or "Untitled product").strip() if product else "Untitled product",
            "image": _product_image(product) if product else "",
            "author": name,
            "rating": review.rating or 0,
            "title": (review.title or "").strip() or "Untitled review",
            "comment": (review.comment or "").strip() or "No comment",
            "status": review.status or "pending",
            "verified": bool(review.verified_purchaser),
            "created": _when(review.created_at),
        })
    return JsonResponse({
        "total": total,
        "average": round(float(average), 1) if average is not None else None,
        "pending": pending,
        "verified": verified,
        "recommend": recommend,
        "reviews": rows,
    })


def _stored_image(image):
    name = getattr(image, "name", "") if image is not None else ""
    if not name or name in _PLACEHOLDER_IMAGES or name.endswith("/default.jpg"):
        return ""
    try:
        return image.url
    except ValueError:
        return ""


def catalog_domains(request):
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from django.db.models import Count, Prefetch, Q
    from apps.marketplace.models import Domain, SubDomain_1, SubDomain_2

    grandchildren = SubDomain_2.objects.order_by("name", "id")
    children = (
        SubDomain_1.objects.prefetch_related(Prefetch("subdomain_1", queryset=grandchildren))
        .order_by("name", "id")
    )
    domains = (
        Domain.objects.annotate(
            products=Count("product_domain", distinct=True),
            active_products=Count("product_domain", filter=Q(product_domain__is_active=True), distinct=True),
        )
        .prefetch_related(Prefetch("domain", queryset=children))
        .order_by("name", "id")
    )
    rows = []
    subdomain_count = 0
    nested_count = 0
    for domain in domains:
        subs = []
        for child in domain.domain.all():
            names = [(grand.name or "Untitled subdomain").strip() for grand in child.subdomain_1.all()]
            subdomain_count += 1
            nested_count += len(names)
            subs.append({"name": (child.name or "Untitled subdomain").strip(), "children": names})
        rows.append({
            "id": domain.id,
            "name": (domain.name or "Untitled domain").strip(),
            "slug": (domain.slug or "").strip(),
            "image": _stored_image(domain.image),
            "active": bool(domain.is_active),
            "products": domain.products or 0,
            "activeProducts": domain.active_products or 0,
            "subdomains": subs,
        })
    mapped = sum(row["products"] for row in rows)
    return JsonResponse({
        "domains": len(rows),
        "activeDomains": sum(1 for row in rows if row["active"]),
        "subdomains": subdomain_count,
        "nested": nested_count,
        "products": mapped,
        "rows": rows,
    })


def _request_row(item, names):
    product_id = (item.product_id or "").strip()
    product = "Unlisted product"
    if product_id.isdigit() and product_id not in {"0", "999999999"}:
        product = names.get(int(product_id)) or f"Product {product_id}"
    return {
        "number": (item.number or item.ritm_number or "").strip() or f"Request {item.id}",
        "person": (item.requested_for or item.opened_by or "").strip() or "Unlisted person",
        "product": product,
        "stage": (item.approval_stage or "").strip() or "Unspecified",
        "when": _when(item.opened_at),
        "ritm": (item.ritm_number or "").strip(),
    }


def marketplace_surfaces(request):
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from django.db.models import Count
    from apps.marketplace.models import Domain, Product
    from apps.orders.models import MarketplaceOrder, Request, Task
    from apps.third_party_apis.modules.checkout.models import Cart, Checkout, CheckoutItem
    from django.db.models import Q

    cached = _recall("surfaces")
    if cached is not None:
        return JsonResponse(cached)
    stages = _request_stage_counts()
    approved = stages["approved"] or 0
    rejected = stages["rejected"] or 0
    requested = stages["requested"] or 0
    not_yet = stages["not_yet"] or 0
    total = stages["total"] or 0
    open_requests = Request.objects.filter(approval_stage__in=["Requested", "Not Yet Requested"]).exclude(opened_at=None).order_by("-opened_at", "-id").only(*_REQUEST_FIELDS)
    rejected_requests = Request.objects.filter(approval_stage="Rejected").exclude(opened_at=None).order_by("-opened_at", "-id").only(*_REQUEST_FIELDS)
    recent = Request.objects.exclude(opened_at=None).order_by("-opened_at", "-id").only(*_REQUEST_FIELDS)
    tasks = Task.objects.order_by("-created", "-id")
    lists = list(recent[:10]) + list(open_requests[:10]) + list(rejected_requests[:10])
    product_ids = []
    for item in lists:
        if (item.product_id or "").isdigit() and item.product_id not in {"0", "999999999"}:
            product_ids.append(int(item.product_id))
    names = dict(Product.objects.filter(id__in=set(product_ids)).values_list("id", "name"))
    domains = list(
        Domain.objects.annotate(products=Count("product_domain", distinct=True)).order_by("-products", "name")[:3]
    )
    catalog = Product.objects.aggregate(
        total=Count("id"),
        approved=Count("id", filter=Q(status__iexact="approved")),
        review=Count("id", filter=Q(data_review_status="pending_review")),
        drafts=Count("id", filter=Q(cwpg_status="draft")),
    )
    lanes = {
        **Cart.objects.aggregate(
            carts=Count("id"),
            productCarts=Count("id", filter=Q(kind="product")),
            darCarts=Count("id", filter=Q(kind="dar")),
        ),
        **Checkout.objects.aggregate(
            checkouts=Count("id"),
            productCheckouts=Count("id", filter=Q(source_cart__kind="product")),
            darCheckouts=Count("id", filter=Q(source_cart__kind="dar")),
        ),
    }
    payload = {
        "products": catalog["total"] or 0,
        "approvedProducts": catalog["approved"] or 0,
        "domains": _safe_count(Domain.objects.all()),
        "dataReview": catalog["review"] or 0,
        "drafts": catalog["drafts"] or 0,
        "requests": total,
        "approved": approved,
        "rejected": rejected,
        "requested": requested,
        "notYet": not_yet,
        "open": requested + not_yet,
        "decisionRate": round(((approved + rejected) / total) * 100) if total else 0,
        "carts": lanes["carts"] or 0,
        "productCarts": lanes["productCarts"] or 0,
        "darCarts": lanes["darCarts"] or 0,
        "checkouts": lanes["checkouts"] or 0,
        "productCheckouts": lanes["productCheckouts"] or 0,
        "darCheckouts": lanes["darCheckouts"] or 0,
        "checkoutItems": _safe_count(CheckoutItem.objects.all()),
        "marketplaceOrders": _safe_count(MarketplaceOrder.objects.all()),
        "tasks": _safe_count(tasks),
        "topDomains": [{"name": domain.name, "products": domain.products} for domain in domains],
        "recent": [_request_row(item, names) for item in recent[:10]],
        "openRequests": [_request_row(item, names) for item in open_requests[:10]],
        "rejectedRequests": [_request_row(item, names) for item in rejected_requests[:10]],
        "taskRows": [
            {
                "number": (task.number or "").strip() or f"Task {task.id}",
                "state": (task.state or "").strip() or "Unspecified",
                "group": (task.assignment_group or "").strip() or "Unassigned",
                "assignee": (task.assigned_to or "").strip() or "Unassigned",
                "due": _when(task.due),
                "ritm": (task.ritm or "").strip(),
            }
            for task in tasks.only("id", "number", "state", "assignment_group", "assigned_to", "due", "ritm")[:10]
        ],
    }
    return JsonResponse(_remember("surfaces", payload))


def _plain(value, limit=180):
    import re

    text = re.sub(r"<[^>]+>", " ", value or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def _person(user):
    if user is None:
        return "Unassigned"
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return name or user.get_username()


def directory_records(request):
    """Catalog, people, form, and notification records for theme pages that still showed samples."""
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    cached = _recall("directory")
    if cached is not None:
        return JsonResponse(cached)
    from django.contrib.auth import get_user_model
    from django.db.models import Count

    from apps.forms.models import FormDefinition
    from apps.marketplace.models import Attribute, Catalog, Datatype, FulfillmentTeam, Keyword, Organization, Platform, Product
    from apps.notifications.models import Notification
    from apps.teams.models import Team

    def counted(model, accessor):
        rows = model.objects.annotate(products=Count(accessor, distinct=True)).order_by("-products", "name")
        return [{"name": (row.name or "").strip() or "Unnamed", "products": row.products} for row in rows]

    organizations = []
    for row in Organization.objects.annotate(products=Count("product", distinct=True)).order_by("-products", "name"):
        organizations.append({
            "name": (row.name or "").strip() or "Unnamed organization",
            "abbrev": (row.abbrev or "").strip(),
            "products": row.products,
        })
    keywords = list(
        Keyword.objects.annotate(products=Count("product", distinct=True)).order_by("-products", "name")
    )
    forms = []
    for form in FormDefinition.objects.annotate(section_count=Count("sections", distinct=True), field_count=Count("fields", distinct=True)).order_by("name"):
        forms.append({
            "name": form.name,
            "version": form.version,
            "published": form.is_published,
            "sections": form.section_count,
            "fields": form.field_count,
            "required": _safe_count(form.fields.filter(required=True)),
        })
    users = []
    for user in get_user_model().objects.order_by("first_name", "last_name", "id"):
        users.append({
            "name": _person(user),
            "email": user.email or user.get_username(),
            "role": "Superuser" if user.is_superuser else "Staff" if user.is_staff else "User",
            "active": user.is_active,
            "seen": _when(user.last_login),
        })
    teams = []
    for team in Team.objects.select_related("owner").annotate(member_count=Count("members", distinct=True)).order_by("name"):
        teams.append({
            "name": team.name,
            "description": _plain(team.description, 120) or "Team",
            "owner": _person(team.owner),
            "members": team.member_count,
        })
    notes = []
    for note in Notification.objects.filter(is_deleted=False).select_related("recipient").order_by("-created_at")[:8]:
        notes.append({
            "title": (note.title or "").strip() or "Notification",
            "body": _plain(note.body, 140) or note.notification_type,
            "type": note.notification_type,
            "read": note.read,
            "when": _when(note.created_at),
            "person": _person(note.recipient),
        })
    products = []
    for item in Product.objects.select_related("datatype", "domain").order_by("name")[:8]:
        price = item.price if item.price is not None else 0
        products.append({
            "id": item.id,
            "name": (item.name or "").strip() or f"Product {item.id}",
            "sku": (item.sku or "").strip() or "—",
            "datatype": item.datatype.name if item.datatype_id and item.datatype else "Unassigned",
            "domain": item.domain.name if item.domain_id and item.domain else "Unassigned",
            "status": (item.status or "").strip() or "draft",
            "price": f"${price:,.2f}",
        })
    payload = {
        "organizations": organizations,
        "catalogs": counted(Catalog, "catalog_name"),
        "keywords": [{"name": (row.name or "").strip() or "Keyword", "products": row.products} for row in keywords[:12]],
        "keywordTotal": len(keywords),
        "keywordsUsed": sum(1 for row in keywords if row.products),
        "keywordsUnused": sum(1 for row in keywords if not row.products),
        "attributes": [{"name": (row.name or "").strip() or "Attribute", "type": (row.type or "").strip() or "Unspecified"} for row in Attribute.objects.order_by("name")],
        "datatypes": counted(Datatype, "product"),
        "platforms": counted(Platform, "product"),
        "fulfillment": counted(FulfillmentTeam, "route_identifier"),
        "products": products,
        "productTotal": _safe_count(Product.objects.all()),
        "users": users,
        "teams": teams,
        "forms": forms,
        "notifications": notes,
        "notificationTotal": _safe_count(Notification.objects.filter(is_deleted=False)),
        "notificationUnread": _safe_count(Notification.objects.filter(is_deleted=False, read=False)),
    }
    return JsonResponse(_remember("directory", payload))


def product_record(request):
    """One marketplace product for the product details page."""
    if not _signed_in(request):
        return JsonResponse({"detail": "Authentication required."}, status=401)
    from apps.marketplace.models import Product, Review
    from apps.orders.models import Request

    raw = (request.GET.get("id") or "").strip()
    if not raw.isdigit():
        return JsonResponse({"detail": "Product id is required."}, status=404)
    item = Product.objects.select_related(
        "domain", "datatype", "classification", "org", "platform", "data_steward"
    ).prefetch_related("keyword", "images").filter(pk=int(raw)).first()
    if item is None:
        return JsonResponse({"detail": "Product not found."}, status=404)
    price = item.price if item.price is not None else 0
    keywords = [name for name in item.keyword.values_list("name", flat=True) if name]
    return JsonResponse({
        "id": item.id,
        "name": (item.name or "").strip() or f"Product {item.id}",
        "sku": (item.sku or "").strip() or "—",
        "domain": item.domain.name if item.domain_id and item.domain else "Unassigned",
        "datatype": item.datatype.name if item.datatype_id and item.datatype else "—",
        "classification": item.classification.name if item.classification_id and item.classification else "—",
        "status": (item.status or "").strip() or "draft",
        "price": f"${price:,.2f}",
        "image": _product_image(item),
        "organization": item.org.name if item.org_id and item.org else "Unassigned",
        "platform": item.platform.name if item.platform_id and item.platform else "Unassigned",
        "steward": item.data_steward.name if item.data_steward_id and item.data_steward else "No data steward",
        "description": _plain(item.short_desc or item.brief_desc, 220) or "No description stored.",
        "keywords": keywords[:4],
        "reviews": _safe_count(Review.objects.filter(product=item)),
        "requests": _safe_count(Request.objects.filter(product_id=str(item.id))),
    })
