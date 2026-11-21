import hashlib
import json

from django.core.paginator import Paginator
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.cache import patch_cache_control
from django.views import View

from .models import Post, ReleaseStatus
from .timeline import serialize_sections, timeline_payload

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def published_releases():
    return Post.objects.filter(status=ReleaseStatus.PUBLISHED).select_related(
        *[f"type{x}" for x in "ABCDEFGHIJ"]
    ).order_by("-release_date", "-id")


def public_payload(post, include_html=False, has_next=False):
    """Return only intentionally public release fields."""
    return timeline_payload(post, include_html=include_html, has_next=has_next)


def apply_public_filters(queryset, params):
    query = (params.get("q") or "").strip()
    if query:
        condition = Q(version__icontains=query) | Q(title__icontains=query) | Q(desc__icontains=query)
        for letter in "ABCDEFGHIJ":
            condition |= Q(**{f"post{letter}__icontains": query})
        queryset = queryset.filter(condition).distinct()

    version = (params.get("version") or "").strip()
    if version:
        queryset = queryset.filter(version__iexact=version)

    category = (params.get("category") or "").strip()
    if category:
        category_filter = Q()
        for letter in "ABCDEFGHIJ":
            category_filter |= Q(**{f"type{letter}__name__iexact": category})
        queryset = queryset.filter(category_filter).distinct()

    year = (params.get("year") or "").strip()
    if year:
        if not year.isdigit() or len(year) != 4:
            raise ValueError("year must be a four-digit number")
        queryset = queryset.filter(release_date__year=int(year))
    return queryset


def page_size(params):
    raw = params.get("page_size", DEFAULT_PAGE_SIZE)
    try:
        return max(1, min(int(raw), MAX_PAGE_SIZE))
    except (TypeError, ValueError):
        raise ValueError(f"page_size must be between 1 and {MAX_PAGE_SIZE}")


def etag_for(data):
    encoded = json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return f'"{hashlib.sha256(encoded).hexdigest()}"'


def conditional_json(request, data, status=200):
    tag = etag_for(data)
    if request.headers.get("If-None-Match") == tag:
        response = HttpResponse(status=304)
    else:
        response = JsonResponse(data, status=status, safe=not isinstance(data, list))
    response["ETag"] = tag
    patch_cache_control(response, public=True, max_age=300)
    return response


class PublicApiIndex(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request):
        data = {
            "name": "Public Changelog API",
            "version": "1",
            "endpoints": {
                "releases": request.build_absolute_uri(reverse("changelog:public-api-releases")),
                "latest": request.build_absolute_uri(reverse("changelog:public-api-latest")),
                "timeline": request.build_absolute_uri(reverse("changelog:public-timeline")),
            },
            "filters": ["q", "version", "category", "year", "page", "page_size", "include_html"],
            "maximum_page_size": MAX_PAGE_SIZE,
        }
        return conditional_json(request, data)


class PublicReleaseListApi(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request):
        try:
            queryset = apply_public_filters(published_releases(), request.GET)
            paginator = Paginator(queryset, page_size(request.GET))
            page = paginator.get_page(request.GET.get("page", 1))
        except ValueError as exc:
            return JsonResponse({"detail": str(exc)}, status=400)

        objects = list(page.object_list)
        include_html = request.GET.get("include_html", "false").lower() == "true"
        results = [
            public_payload(
                post, include_html=include_html,
                has_next=index < len(objects) - 1 or page.has_next(),
            )
            for index, post in enumerate(objects)
        ]
        data = {
            "count": paginator.count,
            "page": page.number,
            "page_size": paginator.per_page,
            "total_pages": paginator.num_pages,
            "next_page": page.next_page_number() if page.has_next() else None,
            "previous_page": page.previous_page_number() if page.has_previous() else None,
            "results": results,
        }
        return conditional_json(request, data)


class PublicLatestReleaseApi(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request):
        post = published_releases().first()
        if post is None:
            return JsonResponse({"detail": "No published release was found."}, status=404)
        include_html = request.GET.get("include_html", "false").lower() == "true"
        return conditional_json(request, public_payload(post, include_html=include_html))


class PublicReleaseDetailApi(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request, version):
        post = published_releases().filter(version=version).first()
        if post is None:
            return JsonResponse({"detail": "Published release was not found."}, status=404)
        include_html = request.GET.get("include_html", "false").lower() == "true"
        return conditional_json(request, public_payload(post, include_html=include_html))


class PublicReleaseHtmlView(View):
    http_method_names = ["get", "head", "options"]

    def get(self, request, version):
        post = published_releases().filter(version=version).first()
        if post is None:
            return HttpResponse("Published release was not found.", status=404, content_type="text/plain; charset=utf-8")
        html = render_to_string(
            "changelog/public/timeline_item.html",
            {"post": post, "sections": serialize_sections(post), "has_next": False},
        )
        tag = etag_for({"version": post.version, "html": html})
        if request.headers.get("If-None-Match") == tag:
            response = HttpResponse(status=304)
        else:
            response = HttpResponse(html, content_type="text/html; charset=utf-8")
        response["ETag"] = tag
        patch_cache_control(response, public=True, max_age=300)
        return response
