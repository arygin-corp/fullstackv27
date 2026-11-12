"""Serve the exact Vexlora HTML theme under /sa/pages/..."""

from __future__ import annotations

import re
from pathlib import Path

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404, HttpResponse
from django.views.static import serve as static_serve

DASHBOARDS = (
    ("executive", "Executive", "Leadership performance and operating priorities."),
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

_BASE_PATH_RE = re.compile(r'data-base-path="[^"]*"')
_GDX_LIVE_RE = re.compile(
    r'\s*<script src="/media/theme/dist/assets/js/gdx-live\.js"></script>'
)


def theme_root() -> Path:
    base = Path(settings.BASE_DIR)
    for candidate in (
        base / "static" / "gdx_admin" / "vexlora",
        base / "assets" / "gdx_admin" / "vexlora",
    ):
        if candidate.is_dir():
            return candidate
    raise Http404("Vexlora theme package is not installed")


def _safe_join(root: Path, *parts: str) -> Path:
    target = (root.joinpath(*parts)).resolve()
    root_resolved = root.resolve()
    if root_resolved != target and root_resolved not in target.parents:
        raise Http404("Invalid theme path")
    return target


def _prepare_html(html: str) -> str:
    html = _BASE_PATH_RE.sub('data-base-path="/sa"', html)
    html = _GDX_LIVE_RE.sub("", html)
    return html


def _render_theme_file(relative: str) -> HttpResponse:
    root = theme_root()
    path = _safe_join(root, *relative.split("/"))
    if not path.is_file():
        raise Http404(f"Vexlora page not found: {relative}")
    html = path.read_text(encoding="utf-8")
    return HttpResponse(_prepare_html(html), content_type="text/html; charset=utf-8")


def _normalize_page_path(page_path: str) -> str:
    cleaned = page_path.strip("/")
    if not cleaned:
        return "dashboard/executive/index.html"
    if cleaned.endswith(".html"):
        return cleaned
    return f"{cleaned}/index.html"


@staff_member_required
def dashboard_index(request):
    return _render_theme_file("index.html")


@staff_member_required
def dashboard(request, slug):
    if slug not in DASHBOARD_MAP:
        raise Http404("Unknown theme dashboard")
    return _render_theme_file(f"pages/dashboard/{slug}/index.html")


@staff_member_required
def dashboard_index_html(request, slug):
    return dashboard(request, slug)


@staff_member_required
def theme_page(request, page_path: str):
    """Serve any other Vexlora HTML page under /sa/pages/<path>."""
    return _render_theme_file(f"pages/{_normalize_page_path(page_path)}")


@staff_member_required
def theme_asset(request, kind: str, asset_path: str):
    """Serve Vexlora theme static trees at /sa/{assets,brand,images,data}/..."""
    if kind not in {"assets", "brand", "images", "data", "templates"}:
        raise Http404("Unknown theme asset tree")
    root = theme_root() / kind
    if not root.is_dir():
        raise Http404("Theme asset tree missing")
    return static_serve(request, asset_path, document_root=str(root))
