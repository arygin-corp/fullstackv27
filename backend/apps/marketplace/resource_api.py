from rest_framework import serializers, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated

from . import models


class MarketplaceCatalogPermission(BasePermission):
    """Published marketplace APIs require a catalog subscription."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        from apps.third_party_apis.modules.apify_platforms.platform.catalog import user_can_call
        from apps.third_party_apis.modules.apify_platforms.platform.models import Api

        api = Api.objects.filter(module_key="marketplace").first()
        if api is None:
            return True
        return user_can_call(request.user, api)


def _serializer(model, fields):
    meta = type("Meta", (), {"model": model, "fields": fields})
    return type(
        f"{model.__name__}ResourceSerializer",
        (serializers.ModelSerializer,),
        {"Meta": meta},
    )


def _viewset(model, serializer, searchable):
    class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = model.objects.all().order_by("pk")
        serializer_class = serializer
        permission_classes = [IsAuthenticated, MarketplaceCatalogPermission]

    ResourceViewSet.__name__ = f"{model.__name__}ResourceViewSet"
    if searchable:
        ResourceViewSet.search_fields = searchable
    return ResourceViewSet


_RESOURCES = (
    ("subdomains", "api-subdomains", models.SubDomain_1, ("id", "sku", "image", "name", "description", "slug", "level", "is_active", "domain", "created_at", "updated_at"), ("name", "slug")),
    ("subdomain-groups", "api-subdomain-groups", models.SubDomain_2, ("id", "sku", "image", "name", "description", "slug", "level", "is_active", "subdomain_1", "created_at", "updated_at"), ("name", "slug")),
    ("datatypes", "api-datatypes", models.Datatype, ("id", "name", "value", "slug", "is_active", "created_at", "updated_at"), ("name", "value", "slug")),
    ("classifications", "api-classifications", models.Classification, ("id", "name", "value", "is_active", "created_at", "updated_at"), ("name", "value")),
    ("contacts", "api-contacts", models.Contact, ("id", "avatar", "name", "email", "is_active", "created_at", "updated_at"), ("name", "email")),
    ("catalogs", "api-catalogs", models.Catalog, ("id", "image", "name", "is_active", "created_at", "updated_at"), ("name",)),
    ("badges", "api-badges", models.Badge, ("id", "name", "image", "is_system", "is_active", "created_at", "updated_at"), ("name",)),
    ("platforms", "api-platforms", models.Platform, ("id", "name", "image", "is_active", "created_at", "updated_at"), ("name",)),
    ("organizations", "api-organizations", models.Organization, ("id", "name", "abbrev", "slug", "image", "is_active", "created_at", "updated_at"), ("name", "abbrev", "slug")),
    ("companies", "api-companies", models.Company, ("id", "name", "abbrev", "is_active", "org", "created_at", "updated_at"), ("name", "abbrev")),
    ("data-stewards", "api-data-stewards", models.DataSteward, ("id", "avatar", "name", "email", "is_active", "company_id", "created_at", "updated_at"), ("name", "email")),
    ("keywords", "api-keywords", models.Keyword, ("id", "name", "is_active", "created_at", "updated_at"), ("name",)),
    ("attribute-types", "api-attribute-types", models.AttributeType, ("id", "name", "is_active", "created_at", "updated_at"), ("name",)),
    ("attributes", "api-attributes", models.Attribute, ("id", "type", "name", "is_active", "created_at", "updated_at"), ("name", "type")),
    ("onets-domains", "api-onets-domains", models.OneTSDomain, ("id", "name", "control_group", "group_name", "description", "data_steward", "is_active", "created_at", "updated_at"), ("name", "control_group", "group_name")),
    ("ad-groups", "api-ad-groups", models.ADGroup, ("id", "name", "value", "is_active", "created_at", "updated_at"), ("name", "value")),
    ("fulfillment-teams", "api-fulfillment-teams", models.FulfillmentTeam, ("id", "name", "team_manager", "team_members", "route_id", "sys_id", "is_active", "created_at", "updated_at"), ("name", "route_id", "sys_id")),
    ("product-images", "api-product-images", models.ProductImage, ("id", "product", "image", "alt_text"), ("alt_text",)),
    ("product-associations", "api-product-associations", models.ProductAssociation, ("id", "product", "associated_product", "is_related", "is_additional", "reason", "position"), ("reason",)),
    ("end-to-end-products", "api-end-to-end-products", models.EndToEndSolutionProduct, ("id", "product", "solution_product", "position"), ()),
    ("synonyms", "api-synonyms", models.Synonym, ("id", "word", "synonyms"), ("word",)),
    ("search-logs", "api-search-logs", models.SearchQueryLog, ("id", "query", "results_count", "user", "created_at"), ("query",)),
    ("reviews", "api-reviews", models.Review, ("id", "product", "author", "rating", "comment", "created_at"), ("comment",)),
    ("search-embeddings", "api-search-embeddings", models.SearchProductEmbedding, ("id", "product", "metadata", "last_updated"), ("metadata",)),
)


def resource_routes():
    routes = []
    for path, basename, model, fields, search_fields in _RESOURCES:
        serializer = _serializer(model, fields)
        routes.append((path, basename, _viewset(model, serializer, search_fields)))
    return routes
