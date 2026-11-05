from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .models import Page


@require_GET
def public_page_by_slug(request, slug):
    try:
        page = (
            Page.objects
            .select_related("published_version", "page_type")
            .prefetch_related("published_version__blocks")
            .get(
                slug=slug,
                is_archived=False,
                is_deleted=False,
                published_version__isnull=False,
            )
        )
    except Page.DoesNotExist:
        return JsonResponse(
            {"detail": "Published page not found.", "slug": slug},
            status=404,
        )

    version = page.published_version
    blocks = version.blocks.filter(is_enabled=True).order_by("position")

    return JsonResponse(
        {
            "id": page.id,
            "title": page.title,
            "slug": page.slug,
            "locale": page.locale,
            "page_type": {
                "id": page.page_type_id,
                "name": page.page_type.name,
                "code": page.page_type.code,
            },
            "version": {
                "id": version.id,
                "number": version.number,
                "title": version.title,
                "summary": version.summary,
                "status": version.status,
            },
            "blocks": [
                {
                    "id": str(block.id),
                    "label": block.label,
                    "block_type": block.block_type,
                    "position": block.position,
                    "payload": block.payload,
                    "content": block.payload.get("content", ""),
                }
                for block in blocks
            ],
        },
        status=200,
        json_dumps_params={"ensure_ascii": False},
    )
