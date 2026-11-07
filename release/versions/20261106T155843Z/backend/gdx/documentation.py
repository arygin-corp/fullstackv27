"""Staff catalog for the static documentation sites stored in the repository."""

from pathlib import Path

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404
from django.shortcuts import render
from django.views.static import serve


DOCUMENTATION_ROOT = Path(settings.BASE_DIR).parent / "documentation"

DOCUMENTATION_SITES = (
    {
        "slug": "apify",
        "title": "Apify Platform",
        "kind": "Apify",
        "detail": "56 articles",
        "description": (
            "Enterprise help center for Apify, including developer "
            "and API reference pages."
        ),
    },
    {
        "slug": "gdx_guides",
        "title": "GDX Platform Documentation",
        "kind": "GDX",
        "detail": "99 pages",
        "description": (
            "Administration guide for the GDX platform, architecture, "
            "and application modules."
        ),
    },
    {
        "slug": "pages",
        "title": "Master Pages Enterprise Manual",
        "kind": "Pages",
        "detail": "Employee manual",
        "description": (
            "User, reviewer, administrator, and operations guide "
            "for Master Pages."
        ),
    },
    {
        "slug": "workflow",
        "title": "Workflow Engine Docs",
        "kind": "Workflow",
        "detail": "550 pages",
        "description": (
            "Workflow engine portal with architecture diagrams, "
            "API catalogs, and deployment runbooks."
        ),
    },
)


def documentation_sites():
    available = []
    for site in DOCUMENTATION_SITES:
        if (DOCUMENTATION_ROOT / site["slug"] / "index.html").is_file():
            available.append(site)
    return available


@staff_member_required
def documentation_hub(request):
    return render(
        request,
        "gdx_admin/documentation/index.html",
        {"sites": documentation_sites()},
    )


@staff_member_required
def documentation_asset(request, site, asset):
    match = next(
        (item for item in DOCUMENTATION_SITES if item["slug"] == site),
        None,
    )
    root = DOCUMENTATION_ROOT / site
    if match is None or not root.is_dir():
        raise Http404("Documentation site was not found.")
    return serve(request, asset or "index.html", document_root=root)
