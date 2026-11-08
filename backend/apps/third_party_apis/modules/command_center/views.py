from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from apps.third_party_apis.modules.command_center.elements import build_realtime, element_groups, widget_dataset
from apps.third_party_apis.modules.command_center.operations import operations_report
from apps.third_party_apis.modules.command_center.platform import (
    KINDS,
    add_element,
    content_page_breakdown,
    create_view,
    delete_view,
    get_view,
    health_checks,
    platform_snapshot,
    remove_element,
    saved_views,
    scope_choices,
)


def _shell(request, section, template, **extra):
    context = {
        "section": section,
        "kinds": KINDS,
        "element_groups": element_groups(),
        **scope_choices(),
        **extra,
    }
    return render(request, template, context)


def welcome_message(now, name):
    hour = now.hour
    if hour < 5:
        greeting = "Burning the midnight oil"
    elif hour < 12:
        greeting = "Good morning"
    elif hour < 17:
        greeting = "Good afternoon"
    elif hour < 19:
        greeting = "Good evening"
    else:
        greeting = "Working late"
    return f"{greeting}, {name}!"


def _person_name(user):
    name = (getattr(user, "first_name", "") or "").strip()
    if not name:
        name = (user.get_full_name() or "").strip() or user.get_username()
    return name


def _chicago_now():
    from zoneinfo import ZoneInfo

    from django.utils import timezone

    return timezone.now().astimezone(ZoneInfo("America/Chicago"))


def _welcome(request):
    return welcome_message(_chicago_now(), _person_name(request.user))


def _greeting_header(request, dataset, realtime):
    from apps.profiles.models import ACCESS_CHOICES, access_type_for

    now = _chicago_now()
    metrics = {row["label"]: row["value"] for row in dataset.get("metrics") or []}
    environments = {"demo": "Demo", "dev": "Dev", "stage": "Stage", "qa": "QA", "prod": "Prod"}
    selected = request.session.get("gdx_environment")
    if selected not in environments:
        selected = "dev"
    clock = now.strftime("%I:%M %p").lstrip("0")
    return {
        "greeting": welcome_message(now, _person_name(request.user)),
        "date": f"{now.strftime('%A, %B')} {now.day}",
        "time": clock,
        "environment": environments[selected],
        "role": dict(ACCESS_CHOICES).get(access_type_for(request.user), "User"),
        "facts": [
            {"label": "Last 30 minutes", "value": realtime.get("active_users", 0)},
            {"label": "People", "value": metrics.get("People", 0)},
            {"label": "Modules enabled", "value": metrics.get("Enabled", 0)},
            {"label": "Builds", "value": metrics.get("Builds", 0)},
        ],
    }


def _initial(name):
    text = (name or "").strip()
    return text[:1].upper() or "?"


def _directory_rows(module_path, model_name, detail_field):
    try:
        imported = __import__(module_path, fromlist=[model_name])
        model = getattr(imported, model_name)
        rows = []
        for item in model.objects.order_by("-id")[:5]:
            name = item.name or "Unnamed"
            rows.append({
                "name": name,
                "detail": getattr(item, detail_field, "") or "No detail",
                "status": "Active" if item.is_active else "Inactive",
                "initial": _initial(name),
            })
        return rows
    except Exception:
        return []


def _steward_rows():
    try:
        from django.db.models import Count

        from apps.marketplace.models import DataSteward

        rows = []
        query = DataSteward.objects.annotate(products=Count("data_steward")).order_by("-id")[:5]
        for item in query:
            name = item.name or "Unnamed steward"
            rows.append({
                "name": name,
                "detail": item.email or "No email",
                "status": item.products,
                "initial": _initial(name),
                "active": item.is_active,
            })
        return rows
    except Exception:
        return []


def _product_names(product_ids):
    numeric = []
    for raw in product_ids:
        text = str(raw or "").strip()
        if text.isdigit() and text != "0":
            numeric.append(int(text))
    if not numeric:
        return {}
    try:
        from apps.marketplace.models import Product

        return {
            str(row["id"]): row["name"] or "Untitled product"
            for row in Product.objects.filter(id__in=numeric).values("id", "name")
        }
    except Exception:
        return {}


def _product_label(product_id, names):
    text = str(product_id or "").strip()
    if not text or text == "0":
        return "—"
    return names.get(text) or text


def _recent_requests():
    try:
        from django.db.models import F

        from apps.orders.models import Request

        rows = []
        query = list(Request.objects.order_by(F("opened_at").desc(nulls_last=True), "-id")[:8])
        names = _product_names(item.product_id for item in query)
        for item in query:
            person = item.requested_for or item.opened_by or item.ritm_number or "Unknown"
            rows.append({
                "number": item.number or item.ritm_number or str(item.pk),
                "person": person,
                "initial": _initial(person),
                "opened": item.opened_at,
                "product": _product_label(item.product_id, names),
                "stage": item.stage or item.approval_stage or "Open",
                "state": item.ritm_state or item.stage or "Open",
                "ritm": item.ritm_number or "—",
            })
        return rows
    except Exception:
        return []


def _order_activity():
    """Request volume from marketplace orders, ending on the newest opened request."""
    from datetime import timedelta

    from django.db.models import Count
    from django.db.models.functions import TruncDate
    from django.utils import timezone

    from apps.orders.models import Request

    empty = {
        "days": [],
        "values": [],
        "breakdown": {"labels": ["Requests"], "values": [0]},
    }
    try:
        latest = (
            Request.objects.filter(opened_at__isnull=False)
            .order_by("-opened_at")
            .values_list("opened_at", flat=True)
            .first()
        )
        end = timezone.localtime(latest).date() if latest else timezone.localdate()
        start = end - timedelta(days=13)
        grouped = {}
        query = (
            Request.objects.filter(opened_at__date__gte=start, opened_at__date__lte=end)
            .annotate(day=TruncDate("opened_at"))
            .values("day")
            .annotate(total=Count("id"))
        )
        for row in query:
            day = row["day"]
            grouped[day.date() if hasattr(day, "hour") else day] = row["total"]
        stages = list(
            Request.objects.exclude(stage="")
            .values("stage")
            .annotate(value=Count("id"))
            .order_by("-value")[:6]
        )
        label_key = "stage"
        if not stages:
            stages = list(
                Request.objects.exclude(ritm_state="")
                .values("ritm_state")
                .annotate(value=Count("id"))
                .order_by("-value")[:6]
            )
            label_key = "ritm_state"
        days = []
        values = []
        for offset in range(14):
            day = start + timedelta(days=offset)
            days.append(day.strftime("%m/%d"))
            values.append(int(grouped.get(day, 0)))
        return {
            "days": days,
            "values": values,
            "breakdown": {
                "labels": [row[label_key] or "Open" for row in stages] or ["Requests"],
                "values": [row["value"] for row in stages] or [0],
            },
        }
    except Exception:
        return empty


def _activity():
    try:
        from gdx.deployment import deployment_history

        rows = []
        for item in deployment_history()[:8]:
            rows.append({
                "label": item.get("version_label") or item.get("target_label") or "Build",
                "detail": item.get("state") or "",
            })
        return rows
    except Exception:
        return []


DASHBOARD_CHARTS = (
    {"type": "kpi_cards", "label": "KPI Cards", "wide": True},
    {"type": "donut", "label": "Modules", "wide": False},
    {"type": "line", "label": "Requests", "wide": False},
)


def _dataset():
    dataset = widget_dataset(platform_snapshot(), _activity(), health_checks())
    metrics = {row["label"]: row["value"] for row in dataset["metrics"]}
    modules = int(metrics.get("Modules") or 0)
    enabled = int(metrics.get("Enabled") or 0)
    dataset["labels"] = ["Enabled", "Disabled"]
    dataset["values"] = [enabled, max(modules - enabled, 0)]
    pages = content_page_breakdown()
    dataset["breakdown"] = {
        "labels": [row["label"] for row in pages][:8] or ["Content pages"],
        "values": [row["value"] for row in pages][:8] or [0],
    }
    return dataset


@staff_member_required
def dashboard(request):
    from apps.third_party_apis.modules.command_center.platform import _deployment_counts

    dataset = _dataset()
    orders = _order_activity()
    dataset["days"] = orders["days"]
    dataset["dayValues"] = orders["values"]
    dataset["breakdown"] = orders["breakdown"]
    realtime = _realtime()
    metrics = {row["label"]: row["value"] for row in dataset.get("metrics") or []}
    days = list(dataset.get("days") or [])
    day_values = [int(value or 0) for value in dataset.get("dayValues") or []]
    earlier = sum(day_values[:7])
    later = sum(day_values[7:])
    change = round((later - earlier) / earlier * 100, 1) if earlier else 0
    builds = _deployment_counts()
    greeting = _greeting_header(request, dataset, realtime)
    greeting["summary"] = (
        f"{metrics.get('Enabled', 0)} modules are enabled, with {metrics.get('People', 0)} people "
        f"on the platform and {realtime.get('active_users', 0)} signed in during the last 30 minutes."
    )
    return _shell(
        request,
        "dashboard",
        "gdx_admin/apps/command_center/dashboard.html",
        dataset=dataset,
        greeting=greeting,
        metrics=metrics,
        content_pages=metrics.get("Content pages", 0),
        staff_pages=metrics.get("Staff pages", 0),
        builds=builds,
        request_total=sum(day_values),
        request_change=change,
        range_label=f"{days[0]} – {days[-1]}" if days else greeting["date"],
        breakdown=list(zip(dataset.get("breakdown", {}).get("labels") or [], dataset.get("breakdown", {}).get("values") or [])),
        customers=_directory_rows("apps.marketplace.models", "Contact", "email"),
        stewards=_steward_rows(),
        organizations=_directory_rows("apps.marketplace.models", "Organization", "abbrev"),
        companies=_directory_rows("apps.marketplace.models", "Company", "abbrev"),
        recent_requests=_recent_requests(),
    )


@staff_member_required
def analytics(request):
    dataset = _dataset()
    dataset["mapView"] = "world"
    dataset["mapBubbles"] = True
    realtime = _realtime()
    return _shell(
        request,
        "analytics",
        "gdx_admin/apps/command_center/analytics.html",
        dataset=dataset,
        realtime=realtime,
        greeting=_greeting_header(request, dataset, realtime),
        operations=operations_report(request.GET),
    )


def _realtime():
    from datetime import timedelta

    from django.contrib.auth import get_user_model
    from django.core.exceptions import ObjectDoesNotExist
    from django.utils import timezone

    from apps.profiles.models import ACCESS_CHOICES, access_type_for

    labels = dict(ACCESS_CHOICES)
    now = timezone.now()
    try:
        logins = list(
            get_user_model().objects.filter(last_login__gte=now - timedelta(minutes=30)).values_list("last_login", flat=True)
        )
        people = []
        for user in get_user_model().objects.select_related("profile").iterator():
            try:
                verified = bool(user.profile.is_verified)
            except ObjectDoesNotExist:
                verified = False
            people.append({"access": labels.get(access_type_for(user), "User"), "verified": verified})
    except Exception:
        logins = []
        people = []
    return build_realtime(now, logins, people)


@staff_member_required
def my_dashboards(request):
    return _shell(
        request,
        "my_dashboards",
        "gdx_admin/apps/command_center/mine.html",
        page_title="My Dashboards",
        page_description="Dashboards you created.",
        views=saved_views("dashboard", owner=request.user),
        empty_message="You have not created a dashboard yet.",
    )


@staff_member_required
def my_reports(request):
    return _shell(
        request,
        "my_reports",
        "gdx_admin/apps/command_center/mine.html",
        page_title="My Reports",
        page_description="Reports you created.",
        views=saved_views("report", owner=request.user),
        empty_message="You have not created a report yet.",
    )


@staff_member_required
def reports(request):
    return _shell(
        request,
        "reports",
        "gdx_admin/apps/command_center/reports.html",
        views=saved_views("report"),
    )


@staff_member_required
def health(request):
    return _shell(
        request,
        "health",
        "gdx_admin/apps/command_center/health.html",
        checks=health_checks(),
    )


@staff_member_required
def builder(request):
    if request.method == "POST":
        item, message = create_view(
            request.POST.get("name"),
            request.POST.get("kind"),
            request.POST.get("scope"),
            request.user.get_full_name() or request.user.get_username(),
            request.POST.getlist("elements"),
            created_by_id=request.user.pk,
        )
        if item is None:
            return _shell(
                request,
                "create",
                "gdx_admin/apps/command_center/create.html",
                error=message,
                selected=request.POST.getlist("elements"),
            )
        return redirect("command_center:view", view_id=item["id"])
    return _shell(request, "create", "gdx_admin/apps/command_center/create.html", selected=[])


@staff_member_required
def workflow(request):
    from apps.third_party_apis.modules.command_center.workflow import decide_approval, pending_approvals

    if request.method == "POST":
        try:
            decide_approval(
                request.user,
                request.POST.get("kind"),
                request.POST.get("object_id"),
                request.POST.get("decision"),
                request.POST.get("comment"),
            )
        except (ValidationError, PermissionDenied) as exc:
            messages.error(request, " ".join(getattr(exc, "messages", []) or [str(exc)]))
        else:
            messages.success(request, "The approval was recorded.")
        return redirect("command_center:workflow")
    items = pending_approvals(request.user)
    waiting = [item for item in items if (item.get("status") or "").lower() != "published"]
    return _shell(
        request,
        "workflow",
        "gdx_admin/apps/command_center/workflow.html",
        approvals=items,
        approval_count=len(waiting),
    )


@staff_member_required
def view_detail(request, view_id):
    item = get_view(view_id)
    if item is None:
        return redirect("command_center:dashboard")
    snapshot = platform_snapshot(item.get("scope") or "platform", item.get("scope_id") or "")
    return _shell(
        request,
        item.get("kind") or "dashboard",
        "gdx_admin/apps/command_center/detail.html",
        item=item,
        snapshot=snapshot,
        dataset=widget_dataset(snapshot, _activity(), health_checks()),
    )


@staff_member_required
@require_POST
def add(request, view_id):
    item, message = add_element(view_id, request.POST.get("element"))
    if item is None:
        return redirect("command_center:dashboard")
    return redirect("command_center:view", view_id=view_id)


@staff_member_required
@require_POST
def remove(request, view_id):
    item = get_view(view_id)
    delete_view(view_id)
    if item and item.get("kind") == "dashboard":
        return redirect("command_center:dashboard")
    return redirect("command_center:reports")


@staff_member_required
@require_POST
def remove_widget(request, view_id, element_id):
    remove_element(view_id, element_id)
    return redirect("command_center:view", view_id=view_id)
