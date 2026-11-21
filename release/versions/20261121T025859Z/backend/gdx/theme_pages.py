"""Serve the exact Vexlora HTML theme under /sa/pages/..."""

from __future__ import annotations

import re
from pathlib import Path

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404, HttpResponse
from django.shortcuts import redirect
from django.views.static import serve as static_serve

DASHBOARDS = (
    ("executive", "Executive", "Leadership performance and operating priorities."),
    ("command", "Command Center", "The whole application for superadmins and engineering."),
    ("modules", "Modules", "Subscriptions, plans, renewals, retention, and trials."),
    ("marketplace", "Marketplace", "Catalog, access requests, and storefront operations."),
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
DASHBOARD_RENAMES = {"saas": "modules", "ecommerce": "marketplace"}

_BASE_PATH_RE = re.compile(r'data-base-path="[^"]*"')
_GDX_LIVE_RE = re.compile(
    r'\s*<script src="/media/theme/dist/assets/js/gdx-live\.js"></script>'
)
_URL_ATTR_RE = re.compile(r'\b(href|src)=("|\')([^"\']+)\2')
_ASSET_PREFIXES = ("assets/", "brand/", "images/", "data/", "templates/")


def _compiled_css(candidate: Path) -> bool:
    css = candidate / "assets" / "css" / "app.css"
    if not css.is_file():
        return False
    head = css.read_text(encoding="utf-8", errors="ignore")[:80].lstrip()
    return head.startswith("/*! tailwindcss") or head.startswith("@layer")


def theme_root() -> Path:
    base = Path(settings.BASE_DIR)
    candidates = (
        base / "media" / "theme" / "dist",
        base / "static" / "gdx_admin" / "vexlora",
        base / "assets" / "gdx_admin" / "vexlora",
    )
    for candidate in candidates:
        if _compiled_css(candidate):
            return candidate
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    raise Http404("Vexlora theme package is not installed")


def _safe_join(root: Path, *parts: str) -> Path:
    target = (root.joinpath(*parts)).resolve()
    root_resolved = root.resolve()
    if root_resolved != target and root_resolved not in target.parents:
        raise Http404("Invalid theme path")
    return target


def _mounted_url(value: str) -> str | None:
    """Turn a theme-relative link into /sa/dashboard/executive/ or /sa/assets/..."""
    if re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|/)", value, re.I):
        return None
    hash_at = value.find("#")
    fragment = value[hash_at:] if hash_at >= 0 else ""
    path = value[:hash_at] if hash_at >= 0 else value
    query_at = path.find("?")
    query = path[query_at:] if query_at >= 0 else ""
    if query_at >= 0:
        path = path[:query_at]
    parts: list[str] = []
    for segment in path.split("/"):
        if segment in {"", "."}:
            continue
        if segment == "..":
            if parts:
                parts.pop()
            continue
        parts.append(segment)
    if not parts:
        return None
    relative = "/".join(parts)
    if relative.startswith("pages/"):
        relative = relative[len("pages/") :]
        if relative.endswith("/index.html"):
            relative = relative[: -len("/index.html")]
        elif relative == "index.html":
            relative = ""
        route = relative.strip("/") or "dashboard/executive"
        return f"/sa/{route}/{query}{fragment}"
    if relative.startswith(_ASSET_PREFIXES):
        return f"/sa/{relative}{query}{fragment}"
    return None


_APP_JS_RE = re.compile(r'((?:src)=["\'])([^"\']*assets/js/app\.js)(?:\?[^"\']*)?(["\'])')
_TITLE_RE = re.compile(r"<title>(.*?)</title>", re.I | re.S)
_BRAND_NAME_RE = re.compile(r"(data-brand-name(?:=\"\")?>)Vexlora")
_PLATFORM_NAME = "GDX Platform"
def _rewrite_title(match: re.Match[str]) -> str:
    page = re.sub(
        r"\s*(?:—|–|-|\|)\s*(?:Vexlora Admin|GDX Platform)\s*$",
        "",
        match.group(1),
    ).strip()
    if not page or page in {"Vexlora Admin", _PLATFORM_NAME}:
        titled = _PLATFORM_NAME
    else:
        titled = f"{page} | {_PLATFORM_NAME}"
    return f"<title>{titled}</title>"


_BOOT_STYLE = (
    '<style id="gdx-boot">html:not([data-app-ready="true"]) body{visibility:hidden}</style>'
    '<script>setTimeout(function(){document.documentElement.dataset.appReady="true"},8000)</script>'
    '<noscript><style>body{visibility:visible!important}</style></noscript>'
)


def _prepare_html(html: str) -> str:
    html = _BASE_PATH_RE.sub('data-base-path="/sa"', html)
    html = _GDX_LIVE_RE.sub("", html)

    def replace_attr(match: re.Match[str]) -> str:
        mounted = _mounted_url(match.group(3))
        if not mounted:
            return match.group(0)
        return f"{match.group(1)}={match.group(2)}{mounted}{match.group(2)}"

    html = _URL_ATTR_RE.sub(replace_attr, html)
    html = html.replace("/ecommerce/", "/marketplace/")
    html = _TITLE_RE.sub(_rewrite_title, html, count=1)
    html = _BRAND_NAME_RE.sub(rf"\1{_PLATFORM_NAME}", html)
    html = _APP_JS_RE.sub(r"\1\2?v=51\3", html)
    if "<head>" in html:
        html = html.replace("<head>", "<head>" + _BOOT_STYLE, 1)
    return html


def _site_build_html(request) -> str:
    from django.template.loader import render_to_string

    from gdx.deployment import (
        ENVIRONMENT_CHOICES,
        ai_engine_analytics,
        deployment_analytics,
        deployment_config,
        deployment_status,
    )

    config = deployment_config()
    return render_to_string(
        "gdx_admin/pages/deployment/partials/_site_build.html",
        {
            "deployment": deployment_status(),
            "config": config,
            "environments": ENVIRONMENT_CHOICES,
            "can_build": request.user.is_superuser,
            "analytics": deployment_analytics()["counts"],
            "ai_analytics": ai_engine_analytics(),
        },
        request=request,
    )


def _with_site_build(request, html: str) -> str:
    marker = '<div id="content-inner" class="mx-auto w-full"><div class="grid gap-6">'
    if marker not in html:
        return html
    heading = (
        '<div class="min-w-0">'
        '<p class="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Code Deployments</p>'
        '<h2 class="text-2xl font-bold leading-8 tracking-tight text-foreground">Deployments</h2>'
        "</div>"
    )
    return html.replace(marker, marker + heading + _site_build_html(request), 1)


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


def _legacy_pages_redirect(request, canonical: str):
    if not request.path.startswith("/sa/pages/"):
        return None
    query = request.META.get("QUERY_STRING", "")
    target = f"{canonical}?{query}" if query else canonical
    if request.get_full_path() == target:
        return None
    return redirect(target)


@staff_member_required
def dashboard_index(request):
    bounced = _legacy_pages_redirect(request, "/sa/dashboard/executive/")
    if bounced is not None:
        return bounced
    return redirect("/sa/dashboard/executive/")


@staff_member_required
def dashboard(request, slug):
    renamed = DASHBOARD_RENAMES.get(slug)
    slug = renamed or slug
    if slug not in DASHBOARD_MAP:
        raise Http404("Unknown theme dashboard")
    canonical = f"/sa/dashboard/{slug}/"
    bounced = _legacy_pages_redirect(request, canonical)
    if bounced is not None:
        return bounced
    if renamed:
        query = request.META.get("QUERY_STRING", "")
        return redirect(f"{canonical}?{query}" if query else canonical)
    return _render_theme_file(f"pages/dashboard/{slug}/index.html")


@staff_member_required
def dashboard_index_html(request, slug):
    return dashboard(request, slug)


def _slash_redirect(request):
    """Relative theme links are written for a directory URL. A missing slash resolves them at the site root."""
    path = request.path
    if path.endswith("/"):
        return None
    target = f"{path}/"
    query = request.META.get("QUERY_STRING", "")
    if query:
        target = f"{target}?{query}"
    return redirect(target)


def _without_ecommerce(page_path: str) -> str:
    parts = [segment for segment in page_path.strip("/").split("/") if segment]
    return "/".join("marketplace" if segment == "ecommerce" else segment for segment in parts)


def _theme_file(relative: str) -> Path | None:
    path = _safe_join(theme_root(), *relative.split("/"))
    return path if path.is_file() else None


def _ecommerce_file(page_path: str) -> str | None:
    """Theme files still live under pages/ecommerce while the public route says marketplace."""
    parts = [segment for segment in page_path.strip("/").split("/") if segment]
    if "marketplace" not in parts:
        return None
    swapped = []
    replaced = False
    for segment in parts:
        if segment == "marketplace" and not replaced:
            swapped.append("ecommerce")
            replaced = True
        else:
            swapped.append(segment)
    relative = f"pages/{_normalize_page_path('/'.join(swapped))}"
    return relative if _theme_file(relative) else None


def _canonical_theme_path(page_path: str) -> str:
    cleaned = page_path.strip("/")
    if cleaned.endswith("/index.html"):
        cleaned = cleaned[: -len("/index.html")]
    elif cleaned.endswith(".html"):
        cleaned = cleaned[: -len(".html")]
    cleaned = cleaned.strip("/")
    if cleaned in {"", "index", "dashboard", "dashboard/index"}:
        cleaned = "dashboard/executive"
    return f"/sa/{cleaned}/"


@staff_member_required
def theme_page(request, page_path: str):
    """Serve a Vexlora HTML page at /sa/<path>/, and redirect the old /sa/pages/ prefix."""
    renamed = _without_ecommerce(page_path)
    if renamed != page_path.strip("/"):
        canonical = _canonical_theme_path(renamed)
        query = request.META.get("QUERY_STRING", "")
        return redirect(f"{canonical}?{query}" if query else canonical)
    canonical = _canonical_theme_path(page_path)
    bounced = _legacy_pages_redirect(request, canonical)
    if bounced is not None:
        return bounced
    if not request.path.endswith("/") and not page_path.endswith(".html"):
        slash = _slash_redirect(request)
        if slash is not None:
            return slash
    if page_path.strip("/") in {"ai/deployment", "ai/deployment/index.html"}:
        page_path = "ai/deployments"
    direct = f"pages/{_normalize_page_path(page_path)}"
    if _theme_file(direct):
        if page_path.strip("/") in {"ai/deployments", "ai/deployments/index.html"}:
            path = _safe_join(theme_root(), *direct.split("/"))
            html = _prepare_html(path.read_text(encoding="utf-8"))
            return HttpResponse(_with_site_build(request, html), content_type="text/html; charset=utf-8")
        return _render_theme_file(direct)
    fallback = _ecommerce_file(page_path)
    if fallback:
        return _render_theme_file(fallback)
    raise Http404(f"Vexlora page not found: {direct}")


@staff_member_required
def theme_asset(request, kind: str, asset_path: str):
    """Serve Vexlora theme static trees at /sa/{assets,brand,images,data}/..."""
    if kind not in {"assets", "brand", "images", "data", "templates"}:
        raise Http404("Unknown theme asset tree")
    root = theme_root() / kind
    if not root.is_dir():
        raise Http404("Theme asset tree missing")
    return static_serve(request, asset_path, document_root=str(root))
