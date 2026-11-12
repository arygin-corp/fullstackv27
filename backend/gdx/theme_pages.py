"""Serve Vexlora-shaped theme pages under sa/pages/dashboard/<slug>/index.html."""

from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404
from django.shortcuts import render

DASHBOARDS = (
    ("executive", "Executive", "Marketplace requests, modules, people, and builds."),
    ("saas", "SaaS", "Subscriptions, plans, renewals, retention, and trials."),
    ("ecommerce", "eCommerce", "Catalog, orders, fulfillment, and storefront ops."),
    ("crm", "CRM", "Leads, pipeline, activities, and forecasting."),
    ("analytics", "Analytics", "Acquisition, funnels, cohorts, and attribution."),
    ("finance", "Finance", "Treasury, receivables, payables, and close."),
    ("projects", "Projects", "Intake, Kanban, milestones, and budget."),
    ("marketing", "Marketing", "Campaigns, audiences, lifecycle, and experiments."),
    ("hr", "HR", "People, roles, attendance, and workforce ops."),
    ("support", "Support", "Tickets, SLAs, queues, and CSAT."),
    ("logistics", "Logistics", "Shipments, carriers, routes, and delivery."),
    ("inventory", "Inventory", "Stock, warehouses, replenishment, and transfers."),
    ("erp", "ERP", "Procurement, suppliers, manufacturing, and master data."),
    ("energy", "Energy", "Assets, usage, outages, and field ops."),
    ("construction", "Construction", "Jobs, crews, materials, and inspections."),
    ("hospital", "Hospital", "Patients, units, scheduling, and clinical ops."),
    ("education", "Education", "Programs, cohorts, enrollment, and outcomes."),
    ("real-estate", "Real Estate", "Listings, leases, occupancy, and maintenance."),
    ("ai", "AI", "Agents, models, knowledge, and AI operations."),
)

DASHBOARD_MAP = {slug: (title, blurb) for slug, title, blurb in DASHBOARDS}


def _snapshot_counts():
    from django.db.models.functions import Lower

    from apps.changelog.models import Post
    from apps.marketplace.models import Domain, Product, Review
    from apps.orders.models import Request
    from apps.teams.models import Team

    products = Product.objects.all()
    requests = Request.objects.annotate(stage_key=Lower("approval_stage"))
    return {
        "products": products.count(),
        "products_approved": products.filter(status__iexact="approved").count(),
        "domains": Domain.objects.count(),
        "teams": Team.objects.count(),
        "reviews": Review.objects.count(),
        "requests": requests.count(),
        "requests_pending": requests.filter(
            stage_key__in=["requested", "not yet requested"]
        ).count(),
        "requests_approved": requests.filter(stage_key="approved").count(),
        "requests_rejected": requests.filter(stage_key="rejected").count(),
        "releases": Post.objects.count(),
        "releases_published": Post.objects.filter(status__iexact="published").count(),
    }


@staff_member_required
def dashboard_index(request):
    return render(
        request,
        "gdx_admin/pages/dashboard/index.html",
        {
            "dashboard_slug": "",
            "dashboard_title": "Theme Dashboards",
            "dashboard_blurb": "Vexlora-shaped dashboards mirrored under sa/pages/dashboard/*/index.html.",
            "staff_page_kicker": "THEME",
            "staff_page_title": "Dashboards",
            "staff_page_description": "Open a dashboard to see live platform data on the SuperAdmin sa/ route.",
            "staff_page_metric_label": "Dashboards",
            "staff_page_metric_value": len(DASHBOARDS),
            "staff_page_metric_caption": "registered",
            "dashboards": [
                {"slug": slug, "title": title, "blurb": blurb}
                for slug, title, blurb in DASHBOARDS
            ],
            "counts": _safe_counts(),
        },
    )


def _safe_counts():
    try:
        return _snapshot_counts()
    except Exception:
        return {}


@staff_member_required
def dashboard(request, slug):
    if slug == "executive":
        from apps.third_party_apis.modules.command_center.views import executive

        return executive(request)

    meta = DASHBOARD_MAP.get(slug)
    if meta is None:
        raise Http404("Unknown theme dashboard")
    title, blurb = meta
    counts = _safe_counts()
    return render(
        request,
        f"gdx_admin/pages/dashboard/{slug}/index.html",
        {
            "dashboard_slug": slug,
            "dashboard_title": title,
            "dashboard_blurb": blurb,
            "staff_page_kicker": "THEME DASHBOARD",
            "staff_page_title": title,
            "staff_page_description": blurb,
            "staff_page_metric_label": "Products",
            "staff_page_metric_value": counts.get("products", 0),
            "staff_page_metric_caption": "in catalog",
            "counts": counts,
        },
    )


@staff_member_required
def dashboard_index_html(request, slug):
    """Exact theme URL mirror: .../index.html"""
    return dashboard(request, slug)
