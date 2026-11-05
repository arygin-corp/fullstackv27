from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.pages.models import ContentBlock, Page, PageVersion


class BlockSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()

    class Meta:
        model = ContentBlock
        fields = ("id", "block_type", "label", "position", "payload", "content", "is_enabled",)

    def get_content(self, obj):
        return obj.payload.get("content", "")


class VersionSerializer(serializers.ModelSerializer):
    blocks = serializers.SerializerMethodField()

    class Meta:
        model = PageVersion
        fields = (
            "id",
            "number",
            "title",
            "summary",
            "status",
            "blocks",
        )

    def get_blocks(self, obj):
        blocks = obj.blocks.filter(is_enabled=True).order_by("position")

        return BlockSerializer(blocks, many=True,).data


class PageSerializer(serializers.ModelSerializer):
    published_version = VersionSerializer(read_only=True)

    class Meta:
        model = Page
        fields = ("id", "title", "slug", "locale", "page_type", "published_version",)

class PageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Page.objects
            .filter(published_version__isnull=False, is_archived=False, is_deleted=False,)
            .select_related("published_version", "page_type",)
            .prefetch_related("published_version__blocks",)
        )

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def page_by_slug(request, slug):
    page = get_object_or_404(
        Page.objects
        .filter(published_version__isnull=False, is_archived=False, is_deleted=False,)
        .select_related("published_version", "page_type",)
        .prefetch_related("published_version__blocks",),
        slug=slug,
    )

    version = page.published_version
    blocks = version.blocks.filter(is_enabled=True).order_by("position")

    return Response({
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
            "status": version.status,
        },
        "blocks": [
            {
                "id": str(block.id),
                "label": block.label,
                "block_type": block.block_type,
                "position": block.position,
                "payload": block.payload,
                "content": block.payload.get(
                    "content",
                    "",
                ),
            }
            for block in blocks
        ],
    })