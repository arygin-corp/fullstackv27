import re
from difflib import SequenceMatcher

from django.core.paginator import Paginator
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Avg, Case, Count, F, Func, Prefetch, Q, Value, When
from django.shortcuts import get_object_or_404

from pgvector.django import CosineDistance

from rest_framework import decorators, renderers, response, status, viewsets
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from apps.resources.models import Brand

from .hybrid_search import hybrid_product_search
from .models import (
    Datatype,
    Domain,
    Product,
    SearchProductEmbedding,
    SubDomain_1,
    SubDomain_2,
    Synonym,
)
from .search_services import encode_search_text
from .serializers import (
    BrandSerializer,
    DatatypeSerializer,
    DomainSerializer,
    EndToEndSolutionProductSerializer,
    ProductAssociationSerializer,
    ProductSerializer,
    ProductSuggestionSerializer,
    SearchQuerySerializer,
)


# ============================================================
# SEARCH THROTTLING
# ============================================================

class SearchUserRateThrottle(UserRateThrottle):
    rate = "60/min"


class SearchAnonRateThrottle(AnonRateThrottle):
    rate = "30/min"


# ============================================================
# SEARCH
# ============================================================

class SearchViewSet(viewsets.ViewSet):
    throttle_classes = [
        SearchUserRateThrottle,
        SearchAnonRateThrottle,
    ]

    def _extract_intent(self, query):
        """Extract supported domain/status filters from raw text."""

        status_keywords = {
            "pending": "pending",
            "draft": "draft",
            "approved": "approved",
            "archived": "archived",
        }

        domain_keywords = [
            "finance",
            "marketing",
            "sales",
            "operations",
            "hr",
        ]

        extracted_filters = {
            "status": None,
            "domain": None,
            "clean_query": query,
        }

        words = query.lower().split()

        for word in words:
            if word in status_keywords:
                extracted_filters["status"] = status_keywords[word]
                extracted_filters["clean_query"] = (
                    extracted_filters["clean_query"]
                    .lower()
                    .replace(word, "")
                    .strip()
                )

            if word in domain_keywords:
                extracted_filters["domain"] = word
                extracted_filters["clean_query"] = (
                    extracted_filters["clean_query"]
                    .lower()
                    .replace(word, "")
                    .strip()
                )

        for filler in [
            "products",
            "product",
            "database",
            "data",
        ]:
            extracted_filters["clean_query"] = (
                extracted_filters["clean_query"]
                .replace(filler, "")
                .strip()
            )

        return extracted_filters

    def _get_single_word_correction(
        self,
        raw_query,
        best_match_name,
    ):
        """
        Compare query words against the best product match and
        return a likely corrected word.
        """

        if not best_match_name:
            return None

        q_words = raw_query.lower().split()
        t_words = re.findall(
            r"\w+",
            best_match_name.lower(),
        )

        for q_word in q_words:
            if len(q_word) < 3:
                continue

            if q_word in t_words:
                continue

            for t_word in t_words:
                similarity = SequenceMatcher(
                    None,
                    q_word,
                    t_word,
                ).ratio()

                if similarity > 0.7:
                    return t_word.capitalize()

        return None

    @decorators.action(detail=False)
    def suggestions(self, request):
        params = SearchQuerySerializer(
            data=request.query_params
        )
        params.is_valid(raise_exception=True)

        raw_query = params.validated_data["query"].strip()
        page_num = params.validated_data["page"]
        limit = params.validated_data["limit"]

        intent = self._extract_intent(raw_query)
        query = intent["clean_query"] or raw_query

        if not raw_query:
            return response.Response({
                "items": [],
                "total_items": 0,
            })

        domain_slug = (
            request.query_params.get("domain")
            or intent["domain"]
        )

        status_filter = (
            intent["status"]
            or "approved"
        )

        if status_filter == "approved":
            base_qs = Product.objects.published()
        else:
            base_qs = Product.objects.filter(
                status=status_filter,
                is_active=True,
            )

        base_qs = base_qs.annotate(
            avg_rating=Avg("reviews__rating")
        )

        if domain_slug:
            base_qs = base_qs.filter(
                domain__slug__icontains=domain_slug
            )

        synonym_match = Synonym.objects.filter(
            word__iexact=query
        ).first()

        search_terms = [query]

        if synonym_match:
            search_terms.extend(
                synonym_match.synonyms
            )

        q_filter = Q(similarity__gt=0.3)

        for term in search_terms:
            q_filter |= Q(
                name__icontains=term
            )

        text_candidates = (
            base_qs
            .annotate(
                similarity=TrigramSimilarity(
                    "name",
                    query,
                )
            )
            .filter(q_filter)
            .order_by(
                "-similarity",
                "-avg_rating",
            )
        )

        text_ids = list(
            text_candidates.values_list(
                "id",
                flat=True,
            )
        )

        semantic_ids = []

        if len(text_ids) < limit:
            try:
                query_vector = encode_search_text(
                    query
                )

                vector_matches = (
                    SearchProductEmbedding.objects
                    .alias(
                        distance=CosineDistance(
                            "vector",
                            query_vector,
                        )
                    )
                    .filter(
                        distance__lt=0.3,
                        product__status=status_filter,
                        product__is_active=True,
                    )
                    .order_by("distance")[:limit]
                )

                semantic_ids = list(
                    vector_matches.values_list(
                        "product_id",
                        flat=True,
                    )
                )

            except Exception as exc:
                print(
                    f"Semantic search failed: {exc}"
                )
                semantic_ids = []

        combined_ids = list(
            dict.fromkeys(
                text_ids + semantic_ids
            )
        )

        if combined_ids:
            preserved_order = Case(
                *[
                    When(
                        id=pk,
                        then=pos,
                    )
                    for pos, pk
                    in enumerate(combined_ids)
                ]
            )

            final_queryset = (
                base_qs
                .filter(
                    id__in=combined_ids
                )
                .select_related(
                    "datatype"
                )
                .prefetch_related(
                    "images"
                )
                .order_by(
                    preserved_order
                )
            )
        else:
            final_queryset = Product.objects.none()

        suggestion = None
        best_match_name = None

        if text_candidates.exists():
            best_match_name = (
                text_candidates[0].name
            )

        elif not combined_ids:
            phonetic_match = (
                Product.objects
                .published()
                .annotate(
                    phonetic_sim=Func(
                        F("name"),
                        Value(query),
                        function="difference",
                    )
                )
                .filter(
                    phonetic_sim__gte=3
                )
                .order_by(
                    "-phonetic_sim"
                )
                .first()
            )

            if phonetic_match:
                best_match_name = (
                    phonetic_match.name
                )

        if best_match_name:
            suggestion = (
                self._get_single_word_correction(
                    raw_query,
                    best_match_name,
                )
            )

        paginator = Paginator(
            final_queryset,
            limit,
        )

        page_obj = paginator.get_page(
            page_num
        )

        return response.Response({
            "items": ProductSuggestionSerializer(
                page_obj,
                many=True,
                context={
                    "request": request
                },
            ).data,
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "total_items": paginator.count,
            "did_you_mean": suggestion,
            "active_filters": {
                "domain": domain_slug,
                "status": status_filter,
            },
        })


# ============================================================
# ORIGINAL SHOP PRODUCT API
# ============================================================

class ShopProductViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        Product.objects
        .published()
        .select_related(
            "domain",
            "subdomain_2",
            "subdomain_3",
            "datatype",
            "classification",
            "org",
            "data_steward",
            "poc_name",
            "business_contact_name",
            "business_sme",
            "one_ts_domain",
            "platform",
        )
        .prefetch_related(
            "images",
            "keyword",
            "badge",
        )
    )

    serializer_class = ProductSerializer

    def get_object(self):
        queryset = self.filter_queryset(
            self.get_queryset()
        )

        lookup_value = self.kwargs.get(
            "pk"
        )

        if not lookup_value:
            return super().get_object()

        if str(lookup_value).isdigit():
            obj = get_object_or_404(
                queryset,
                pk=int(lookup_value),
            )
        else:
            obj = get_object_or_404(
                queryset,
                slug=lookup_value,
            )

        self.check_object_permissions(
            self.request,
            obj,
        )

        return obj

    def get_queryset(self):
        queryset = super().get_queryset()

        sort = self.request.query_params.get(
            "sort"
        )

        if sort == "name_asc":
            queryset = queryset.order_by(
                "name"
            )

        elif sort == "name_desc":
            queryset = queryset.order_by(
                "-name"
            )

        return queryset

    @decorators.action(detail=False)
    def bestsellers(self, request):
        products = (
            self.get_queryset()
            .order_by("id")[:5]
        )

        return Response(
            self.get_serializer(
                products,
                many=True,
            ).data
        )

    @decorators.action(
        detail=False,
        url_path="latest",
    )
    def latest_products(
        self,
        request,
    ):
        products = (
            self.get_queryset()
            .order_by("-created_at")[:8]
        )

        return Response(
            self.get_serializer(
                products,
                many=True,
            ).data
        )

    @decorators.action(
        detail=False,
        url_path="top-rated",
    )
    def top_rated(
        self,
        request,
    ):
        products = (
            self.get_queryset()
            .annotate(
                avg_rating=Avg(
                    "reviews__rating"
                )
            )
            .order_by(
                "-avg_rating"
            )[:5]
        )

        return Response(
            self.get_serializer(
                products,
                many=True,
            ).data
        )

    def list(
        self,
        request,
        *args,
        **kwargs,
    ):
        queryset = self.get_queryset()

        for param, value in (
            request.query_params.items()
        ):
            if not param.startswith(
                "filter_"
            ):
                continue

            filter_name = param.replace(
                "filter_",
                "",
            )

            values = value.split(",")

            if filter_name == "domain":
                queryset = queryset.filter(
                    domain__slug__in=values
                )

            elif filter_name == "datatype":
                queryset = queryset.filter(
                    datatype__slug__in=values
                )

            elif filter_name == "org":
                queryset = queryset.filter(
                    org__slug__in=values
                )

        try:
            page = int(
                request.query_params.get(
                    "page",
                    1,
                )
            )
        except (TypeError, ValueError):
            page = 1

        try:
            limit = int(
                request.query_params.get(
                    "limit",
                    12,
                )
            )
        except (TypeError, ValueError):
            limit = 12

        page = max(page, 1)
        limit = max(
            1,
            min(limit, 100),
        )

        paginator = Paginator(
            queryset,
            limit,
        )

        products_page = paginator.get_page(
            page
        )

        filters = [
            {
                "type": "check",
                "slug": "domain",
                "name": "Domains",
                "items": [
                    {
                        "slug": domain.slug,
                        "name": domain.name,
                        "count": domain.product_count,
                    }
                    for domain in (
                        Domain.objects.annotate(
                            product_count=Count(
                                "product_domain",
                                filter=Q(
                                    product_domain__is_active=True,
                                    product_domain__status="approved",
                                ),
                            )
                        )
                    )
                ],
                "value": (
                    request.query_params
                    .get(
                        "filter_domain",
                        "",
                    )
                    .split(",")
                ),
            },
        ]

        data = {
            "items": self.get_serializer(
                products_page,
                many=True,
            ).data,
            "page": page,
            "limit": limit,
            "total": paginator.count,
            "pages": paginator.num_pages,
            "filters": filters,
            "filterValues": {},
        }

        return Response(
            data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# BRAND
# ============================================================

class BrandViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = Brand.objects.filter(
        is_active=True
    )

    serializer_class = BrandSerializer


# ============================================================
# SHOP DOMAIN
# ============================================================

class ShopDomainViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = DomainSerializer
    lookup_field = "slug"

    def get_image(self, obj):
        request = self.context.get(
            "request"
        )

        if (
            obj.image
            and hasattr(
                obj.image,
                "url",
            )
        ):
            if request:
                return (
                    request.build_absolute_uri(
                        obj.image.url
                    )
                )

            return (
                f"http://localhost:8000"
                f"{obj.image.url}"
            )

        return ""

    def get_queryset(self):
        level3_qs = (
            SubDomain_2.objects
            .filter(
                is_active=True
            )
            .annotate(
                product_count=Count(
                    "product_subdomain_3"
                )
            )
            .prefetch_related(
                "product_subdomain_3"
            )
            .order_by(
                "-product_count"
            )
        )

        level2_qs = (
            SubDomain_1.objects
            .filter(
                is_active=True
            )
            .annotate(
                product_count=Count(
                    "product_subdomain_2"
                )
            )
            .prefetch_related(
                "product_subdomain_2",
                Prefetch(
                    "subdomain_1",
                    queryset=level3_qs,
                    to_attr=(
                        "prefetched_subdomains"
                    ),
                ),
            )
            .order_by(
                "-product_count"
            )
        )

        return (
            Domain.objects
            .filter(
                is_active=True
            )
            .annotate(
                product_count=Count(
                    "product_domain"
                )
            )
            .prefetch_related(
                "product_domain",
                Prefetch(
                    "domain",
                    queryset=level2_qs,
                    to_attr=(
                        "prefetched_subdomains"
                    ),
                ),
            )
            .order_by(
                "-product_count"
            )
        )


# ============================================================
# DATATYPE
# ============================================================

class DatatypeViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        Datatype.objects
        .filter(
            is_active=True
        )
        .order_by("name")
    )

    serializer_class = DatatypeSerializer


# ============================================================
# SERIALIZATION HELPERS
# ============================================================

def serialize_related(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "slug": getattr(
            obj,
            "slug",
            None,
        ),
    }


def get_file_url(
    request,
    file_field,
):
    if not file_field:
        return None

    try:
        return request.build_absolute_uri(
            file_field.url
        )
    except (
        ValueError,
        AttributeError,
    ):
        return None


def serialize_domain(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "sku": obj.sku,
        "name": obj.name,
        "description": obj.description,
        "level": obj.level,
        "slug": obj.slug,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
    }


def serialize_subdomain_2(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "sku": obj.sku,
        "name": obj.name,
        "description": obj.description,
        "slug": obj.slug,
        "level": obj.level,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
        "domain_id": obj.domain_id,
    }


def serialize_subdomain_3(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "sku": obj.sku,
        "name": obj.name,
        "description": obj.description,
        "slug": obj.slug,
        "level": obj.level,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
        "subdomain_1_id": (
            obj.subdomain_1_id
        ),
    }


def serialize_datatype(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "value": obj.value,
        "slug": obj.slug,
        "is_active": obj.is_active,
    }


def serialize_classification(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "value": obj.value,
        "is_active": obj.is_active,
    }


def serialize_organization(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "abbrev": obj.abbrev,
        "slug": obj.slug,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
    }


def serialize_company(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "abbrev": obj.abbrev,
        "is_active": obj.is_active,
        "org_id": obj.org_id,
    }


def serialize_data_steward(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "email": obj.email,
        "avatar": get_file_url(
            request,
            obj.avatar,
        ),
        "is_active": obj.is_active,
        "company": serialize_company(
            obj.company_id
        ),
    }


def serialize_contact(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "email": obj.email,
        "avatar": get_file_url(
            request,
            obj.avatar,
        ),
        "is_active": obj.is_active,
    }


def serialize_catalog(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
    }


def serialize_platform(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "image": get_file_url(
            request,
            obj.image,
        ),
        "is_active": obj.is_active,
    }


def serialize_one_ts_domain(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "control_group": (
            obj.control_group
        ),
        "group_name": obj.group_name,
        "description": obj.description,
        "is_active": obj.is_active,
        "data_steward": (
            serialize_data_steward(
                request,
                obj.data_steward,
            )
        ),
    }


def serialize_ad_group(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "value": obj.value,
        "is_active": obj.is_active,
    }


def serialize_fulfillment_team(
    request,
    obj,
):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
        "route_id": obj.route_id,
        "sys_id": obj.sys_id,
        "is_active": obj.is_active,
        "team_manager": serialize_contact(
            request,
            obj.team_manager,
        ),
        "team_members": serialize_contact(
            request,
            obj.team_members,
        ),
    }


def serialize_team(obj):
    if not obj:
        return None

    return {
        "id": obj.id,
        "name": obj.name,
    }


# ============================================================
# MARKETPLACE PRODUCT JSON API
# ============================================================

class ProductJsonViewSet(viewsets.ViewSet):
    """
    Marketplace Product API.

    list():
        Returns paginated products.

    retrieve():
        Returns one product using either ID or slug.
    """

    renderer_classes = [
        renderers.JSONRenderer
    ]

    FILTER_DEFINITIONS = [
        {
            "slug": "domain",
            "name": "Domain",
            "field": "domain__name",
        },
        {
            "slug": "datatype",
            "name": "Data Type",
            "field": "datatype__name",
        },
        {
            "slug": "classification",
            "name": "Classification",
            "field": (
                "classification__name"
            ),
        },
        {
            "slug": "org_abbrev",
            "name": "Organization",
            "field": "org__abbrev",
        },
        # {
        #     "slug": "environment",
        #     "name": "Environment",
        #     "field": "environment",
        # },
        # {
        #     "slug": "access_type",
        #     "name": "Access Type",
        #     "field": "access_type",
        # },
    ]

    SORT_DEFINITIONS = {
        "name_asc": "name",
        "name_desc": "-name",
        "newest": "-created_at",
        "oldest": "created_at",
        "updated_desc": "-updated_at",
        "updated_asc": "updated_at",
    }

    # -----------------------------------------------------
    # Queryset
    # -----------------------------------------------------

    def get_base_queryset(self):
        return (
            Product.objects
            .published()
            .filter(
                is_active=True
            )
            .select_related(
                "domain",
                "subdomain_2",
                "subdomain_3",
                "datatype",
                "classification",
                "org",
                "data_steward",
                "data_steward__company_id",
                (
                    "data_steward__"
                    "company_id__org"
                ),
                "poc_name",
                "business_contact_name",
                "business_sme",
                "catalog",
                "platform",
                "one_ts_domain",
                "ad_group",
                "fulfillment_group",
                "route_identifier",
                "team",
                "data_review_team",
                "created_by",
                "updated_by",
                "approved_by",
            )
            .prefetch_related(
                "badge",
                "keyword",
                "attribute",
                "images",

                # Product Associations
                "product_associations",
                "product_associations__associated_product",
                "product_associations__associated_product__images",
                "product_associations__associated_product__datatype",

                # End-to-End Solution
                "end_to_end_products",
                "end_to_end_products__solution_product",
                "end_to_end_products__solution_product__images",
                "end_to_end_products__solution_product__datatype",
                "end_to_end_products__solution_product__domain",
                "end_to_end_products__solution_product__classification",
                "end_to_end_products__solution_product__data_steward",
            )
        )

    # -----------------------------------------------------
    # Filter helpers
    # -----------------------------------------------------

    def get_selected_values(
        self,
        request,
        slug,
    ):
        raw_value = (
            request.query_params.get(
                slug
            )
            or request.query_params.get(
                f"filter_{slug}"
            )
            or ""
        )

        if not raw_value:
            return []

        return [
            value.strip()
            for value
            in raw_value.split(",")
            if value.strip()
        ]

    def get_filter_values(
        self,
        request,
    ):
        return {
            definition["slug"]:
                self.get_selected_values(
                    request,
                    definition["slug"],
                )
            for definition
            in self.FILTER_DEFINITIONS
        }

    # -----------------------------------------------------
    # Search
    # -----------------------------------------------------

    def apply_search(
        self,
        queryset,
        request,
    ):
        query = (
            request.query_params.get(
                "q"
            )
            or request.query_params.get(
                "query"
            )
            or ""
        ).strip()

        if not query:
            return queryset

        return queryset.filter(
            Q(
                name__icontains=query
            )
            | Q(
                sku__icontains=query
            )
            | Q(
                slug__icontains=query
            )
            | Q(
                short_desc__icontains=query
            )
            | Q(
                brief_desc__icontains=query
            )
            | Q(
                domain__name__icontains=query
            )
            | Q(
                subdomain_2__name__icontains=query
            )
            | Q(
                subdomain_3__name__icontains=query
            )
            | Q(
                datatype__name__icontains=query
            )
            | Q(
                classification__name__icontains=query
            )
            | Q(
                org__name__icontains=query
            )
            | Q(
                org__abbrev__icontains=query
            )
            | Q(
                catalog__name__icontains=query
            )
            | Q(
                platform__name__icontains=query
            )
            | Q(
                keyword__name__icontains=query
            )
        ).distinct()

    # -----------------------------------------------------
    # Filtering
    # -----------------------------------------------------

    def apply_filters(
        self,
        queryset,
        request,
    ):
        for definition in (
            self.FILTER_DEFINITIONS
        ):
            slug = definition["slug"]
            field = definition["field"]

            selected_values = (
                self.get_selected_values(
                    request,
                    slug,
                )
            )

            if not selected_values:
                continue

            queryset = queryset.filter(
                **{
                    f"{field}__in":
                        selected_values
                }
            )

        return queryset

    # -----------------------------------------------------
    # Sorting
    # -----------------------------------------------------

    def apply_sorting(
        self,
        queryset,
        request,
    ):
        sort_value = (
            request.query_params.get(
                "sort",
                "default",
            )
        )

        ordering = (
            self.SORT_DEFINITIONS.get(
                sort_value,
                "id",
            )
        )

        return queryset.order_by(
            ordering
        )

    # -----------------------------------------------------
    # Privacy Filter metadata
    # -----------------------------------------------------

    def build_privacy_filter(self, queryset, request,):
        selected_values = self.get_selected_values(
            request,
            "privacy",
        )

        pi_count = (
            queryset
            .filter(
                pi__iexact="yes"
            )
            .values("id")
            .distinct()
            .count()
        )

        spi_count = (
            queryset
            .filter(
                sensitive_pi__iexact="yes"
            )
            .values("id")
            .distinct()
            .count()
        )

        return {
            "type": "check",
            "slug": "privacy",
            "name": "Privacy",
            "value": selected_values,
            "items": [
                {
                    "slug": "pi",
                    "name": "PI",
                    "count": pi_count,
                },
                {
                    "slug": "spi",
                    "name": "SPI",
                    "count": spi_count,
                },
            ],
        }

    # -----------------------------------------------------
    # Filter metadata
    # -----------------------------------------------------

    def build_check_filter(
        self,
        queryset,
        slug,
        name,
        field,
        selected_values,
    ):
        rows = (
            queryset
            .exclude(
                **{
                    f"{field}__isnull":
                        True
                }
            )
            .exclude(
                **{
                    field: ""
                }
            )
            .values(field)
            .annotate(
                count=Count(
                    "id",
                    distinct=True,
                )
            )
            .order_by(field)
        )

        items = []

        for row in rows:
            item_value = row.get(
                field
            )

            if item_value is None:
                continue

            item_value = str(
                item_value
            ).strip()

            if not item_value:
                continue

            items.append({
                "slug": item_value,
                "name": item_value,
                "count": row["count"],
            })

        return {
            "type": "check",
            "slug": slug,
            "name": name,
            "value": selected_values,
            "items": items,
        }

    def build_filters(
            self,
            queryset,
            request,
    ):
        filters = []

        for definition in self.FILTER_DEFINITIONS:
            slug = definition["slug"]

            filters.append(
                self.build_check_filter(
                    queryset=queryset,
                    slug=slug,
                    name=definition["name"],
                    field=definition["field"],
                    selected_values=(
                        self.get_selected_values(
                            request,
                            slug,
                        )
                    ),
                )
            )

        # Add virtual Privacy filter
        filters.append(
            self.build_privacy_filter(
                queryset=queryset,
                request=request,
            )
        )

        return filters

    # -----------------------------------------------------
    # Pagination
    # -----------------------------------------------------

    def get_pagination(
        self,
        request,
    ):
        try:
            page = int(
                request.query_params.get(
                    "page",
                    1,
                )
            )
        except (
            TypeError,
            ValueError,
        ):
            page = 1

        try:
            limit = int(
                request.query_params.get(
                    "limit",
                    12,
                )
            )
        except (
            TypeError,
            ValueError,
        ):
            limit = 12

        page = max(
            page,
            1,
        )

        limit = max(
            1,
            min(
                limit,
                100,
            ),
        )

        return page, limit

    # -----------------------------------------------------
    # Serialization
    # -----------------------------------------------------

    def serialize_end_to_end_solution(
        self,
        request,
        product,
    ):
        """
        Serialize the ordered End-to-End products configured for
        the current marketplace product.

        The response matches the Angular EndToEndSolution contract.
        """
        entries = (
            product.end_to_end_products
            .select_related(
                "solution_product",
                "solution_product__datatype",
                "solution_product__domain",
                "solution_product__classification",
                "solution_product__data_steward",
            )
            .prefetch_related(
                "solution_product__images",
            )
            .order_by(
                "position",
                "id",
            )
        )

        if not entries.exists():
            return None

        description = re.sub(
            r"<[^>]+>",
            "",
            str(
                product.short_desc
                or product.brief_desc
                or ""
            ),
        ).strip()

        return {
            "id": product.id,
            "name": (
                f"{product.name} "
                "End-to-End Solution"
            ),
            "description": description,
            "status": "published",
            "products": (
                EndToEndSolutionProductSerializer(
                    entries,
                    many=True,
                    context={
                        "request": request,
                    },
                ).data
            ),
        }

    def serialize_product(
        self,
        request,
        product,
    ):
        return {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "sku": product.sku,
            "brief_desc": (
                product.brief_desc
            ),
            "short_desc": (
                product.short_desc
            ),
            "intended_use": (
                product.intended_use
            ),

            "domain": (
                product.domain.name
                if product.domain
                else None
            ),

            "subdomain_2": (
                product.subdomain_2.name
                if product.subdomain_2
                else None
            ),

            "subdomain_3": (
                product.subdomain_3.name
                if product.subdomain_3
                else None
            ),

            "datatype": (
                product.datatype.name
                if product.datatype
                else None
            ),

            "classification": (
                product.classification.name
                if product.classification
                else None
            ),

            "org": (
                product.org.name
                if product.org
                else None
            ),

            "org_abbrev": (
                product.org.abbrev
                if product.org
                else None
            ),

            "data_steward":
                serialize_data_steward(
                    request,
                    product.data_steward,
                ),

            "poc_name":
                serialize_contact(
                    request,
                    product.poc_name,
                ),

            "business_contact":
                serialize_contact(
                    request,
                    product.business_contact_name,
                ),

            "business_sme":
                serialize_contact(
                    request,
                    product.business_sme,
                ),

            "catalog": (
                product.catalog.name
                if product.catalog
                else None
            ),

            "platform": (
                product.platform.name
                if product.platform
                else None
            ),

            "one_ts_domain": (
                product.one_ts_domain.name
                if product.one_ts_domain
                else None
            ),

            "ad_group": (
                product.ad_group.name
                if product.ad_group
                else None
            ),

            "fulfillment_group": (
                product.fulfillment_group.name
                if product.fulfillment_group
                else None
            ),

            "route_identifier": (
                product.route_identifier.name
                if product.route_identifier
                else None
            ),

            "team": (
                product.team.name
                if product.team
                else None
            ),

            "data_review_team": (
                product.data_review_team.name
                if product.data_review_team
                else None
            ),

            "resource_url":
                product.resource_url,

            "original_name":
                product.original_name,

            "price": (
                str(product.price)
                if product.price is not None
                else None
            ),

            "usertype":
                product.usertype,

            "access_type":
                product.access_type,

            "environment":
                product.environment,

            "data_access_type":
                product.data_access_type,

            "availability":
                product.availability,

            "frequency":
                product.frequency,

            "hide_me":
                product.hide_me,

            "max":
                product.max,

            "pi":
                product.pi,

            "sensitive_pi":
                product.sensitive_pi,

            "badges": [
                badge.name
                for badge
                in product.badge.all()
            ],

            "keywords": [
                keyword.name
                for keyword
                in product.keyword.all()
            ],

            "attributes": [
                attribute.name
                for attribute
                in product.attribute.all()
            ],

            "images": [
                request.build_absolute_uri(
                    image.image.url
                )
                for image
                in product.images.all()
                if image.image
            ],

            "data_review_required":
                product.data_review_required,

            "data_review_status":
                product.data_review_status,

            "cwpg_status":
                product.cwpg_status,

            "status":
                product.status,

            "is_active":
                product.is_active,

            "created_by": (
                product.created_by.username
                if product.created_by
                else None
            ),

            "created_at": (
                product.created_at.isoformat()
                if product.created_at
                else None
            ),

            "updated_by": (
                product.updated_by.username
                if product.updated_by
                else None
            ),

            "updated_at": (
                product.updated_at.isoformat()
                if product.updated_at
                else None
            ),

            "approved_by": (
                product.approved_by.username
                if product.approved_by
                else None
            ),

            "approved_at": (
                product.approved_at.isoformat()
                if product.approved_at
                else None
            ),

            # ---------------------------------------------
            # Product associations
            # ---------------------------------------------
            "associated_products": ProductAssociationSerializer(
                product.product_associations.all(),
                many=True,
                context={
                    "request": request,
                },
            ).data,

            # ---------------------------------------------
            # End-to-End Solution
            # ---------------------------------------------
            "end_to_end_solution": (
                self.serialize_end_to_end_solution(
                    request,
                    product,
                )
            ),
        }

    # -----------------------------------------------------
    # DETAIL ENDPOINT
    #
    # IMPORTANT:
    # This belongs in ProductJsonViewSet.
    # -----------------------------------------------------

    def retrieve(
        self,
        request,
        pk=None,
    ):
        lookup_value = str(
            pk or ""
        ).strip()

        if not lookup_value:
            return Response(
                {
                    "error": (
                        "A product ID or "
                        "slug is required."
                    )
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        queryset = (
            self.get_base_queryset()
        )

        if lookup_value.isdigit():
            product = get_object_or_404(
                queryset,
                pk=int(
                    lookup_value
                ),
            )
        else:
            product = get_object_or_404(
                queryset,
                slug=lookup_value,
            )

        return Response(
            self.serialize_product(
                request,
                product,
            ),
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # LIST ENDPOINT
    # -----------------------------------------------------

    def list(
        self,
        request,
    ):
        try:
            base_queryset = (
                self.get_base_queryset()
            )

            searched_queryset = (
                self.apply_search(
                    base_queryset,
                    request,
                )
            )

            filters = (
                self.build_filters(
                    searched_queryset,
                    request,
                )
            )

            filtered_queryset = (
                self.apply_filters(
                    searched_queryset,
                    request,
                )
            )

            filtered_queryset = (
                self.apply_sorting(
                    filtered_queryset,
                    request,
                )
            )

            requested_page, limit = (
                self.get_pagination(
                    request
                )
            )

            paginator = Paginator(
                filtered_queryset,
                limit,
            )

            page_object = (
                paginator.get_page(
                    requested_page
                )
            )

            products = [
                self.serialize_product(
                    request,
                    product,
                )
                for product
                in page_object.object_list
            ]

            filter_values = {
                slug: ",".join(values)
                for slug, values
                in (
                    self.get_filter_values(
                        request
                    ).items()
                )
                if values
            }

            return Response(
                {
                    "debug_version":
                        "FILTER_API_V2",

                    "count":
                        paginator.count,

                    "page":
                        page_object.number,

                    "limit":
                        limit,

                    "pages":
                        paginator.num_pages,

                    "has_previous":
                        page_object.has_previous(),

                    "has_next":
                        page_object.has_next(),

                    "from": (
                        page_object.start_index()
                        if paginator.count
                        else 0
                    ),

                    "to": (
                        page_object.end_index()
                        if paginator.count
                        else 0
                    ),

                    "products":
                        products,

                    "filters":
                        filters,

                    "filterValues":
                        filter_values,
                },
                status=(
                    status.HTTP_200_OK
                ),
            )

        except Exception as exc:
            return Response(
                {
                    "error": (
                        "Unable to retrieve "
                        "products."
                    ),
                    "detail": str(exc),
                    "type": (
                        type(exc).__name__
                    ),
                },
                status=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )


# ============================================================
# DOMAIN JSON API
# ============================================================

class DomainJsonViewSet(
    viewsets.ViewSet
):
    renderer_classes = [
        renderers.JSONRenderer
    ]

    def _get_image_url(
        self,
        request,
        obj,
    ):
        if not obj:
            return None

        image = getattr(
            obj,
            "image",
            None,
        )

        if not image:
            return None

        try:
            return (
                request.build_absolute_uri(
                    image.url
                )
            )
        except (
            ValueError,
            AttributeError,
        ):
            return None

    def _get_description(
        self,
        obj,
    ):
        if not obj:
            return None

        return getattr(
            obj,
            "description",
            None,
        )

    def list(
        self,
        request,
    ):
        try:
            products = (
                Product.objects
                .filter(
                    domain__is_active=True
                )
                .select_related(
                    "domain",
                    "subdomain_2",
                    "subdomain_3",
                )
                .order_by("id")
            )

            domain_map = {}

            for product in products:
                domain = product.domain

                if (
                    not domain
                    or not domain.is_active
                ):
                    continue

                if domain.id not in domain_map:
                    domain_map[
                        domain.id
                    ] = {
                        "id":
                            domain.id,
                        "name":
                            domain.name,
                        "slug":
                            getattr(
                                domain,
                                "slug",
                                None,
                            ),
                        "description":
                            self._get_description(
                                domain
                            ),
                        "image":
                            self._get_image_url(
                                request,
                                domain,
                            ),
                        "product_count":
                            0,
                        "subdomains":
                            {},
                    }

                domain_data = (
                    domain_map[
                        domain.id
                    ]
                )

                domain_data[
                    "product_count"
                ] += 1

                subdomain_2 = (
                    product.subdomain_2
                )

                if (
                    not subdomain_2
                    or not getattr(
                        subdomain_2,
                        "is_active",
                        False,
                    )
                ):
                    continue

                subdomain_2_map = (
                    domain_data[
                        "subdomains"
                    ]
                )

                if (
                    subdomain_2.id
                    not in subdomain_2_map
                ):
                    subdomain_2_map[
                        subdomain_2.id
                    ] = {
                        "id":
                            subdomain_2.id,
                        "name":
                            subdomain_2.name,
                        "slug":
                            getattr(
                                subdomain_2,
                                "slug",
                                None,
                            ),
                        "description":
                            self._get_description(
                                subdomain_2
                            ),
                        "image":
                            self._get_image_url(
                                request,
                                subdomain_2,
                            ),
                        "product_count":
                            0,
                        "subdomains":
                            {},
                    }

                subdomain_2_data = (
                    subdomain_2_map[
                        subdomain_2.id
                    ]
                )

                subdomain_2_data[
                    "product_count"
                ] += 1

                subdomain_3 = (
                    product.subdomain_3
                )

                if (
                    not subdomain_3
                    or not getattr(
                        subdomain_3,
                        "is_active",
                        False,
                    )
                ):
                    continue

                subdomain_3_map = (
                    subdomain_2_data[
                        "subdomains"
                    ]
                )

                if (
                    subdomain_3.id
                    not in subdomain_3_map
                ):
                    subdomain_3_map[
                        subdomain_3.id
                    ] = {
                        "id":
                            subdomain_3.id,
                        "name":
                            subdomain_3.name,
                        "slug":
                            getattr(
                                subdomain_3,
                                "slug",
                                None,
                            ),
                        "description":
                            self._get_description(
                                subdomain_3
                            ),
                        "image":
                            self._get_image_url(
                                request,
                                subdomain_3,
                            ),
                        "product_count":
                            0,
                    }

                subdomain_3_map[
                    subdomain_3.id
                ][
                    "product_count"
                ] += 1

            domain_data = []

            for domain in (
                domain_map.values()
            ):
                if (
                    domain[
                        "product_count"
                    ] <= 0
                ):
                    continue

                subdomain_2_data = []

                for subdomain_2 in (
                    domain[
                        "subdomains"
                    ].values()
                ):
                    if (
                        subdomain_2[
                            "product_count"
                        ] <= 0
                    ):
                        continue

                    subdomain_3_data = []

                    for subdomain_3 in (
                        subdomain_2[
                            "subdomains"
                        ].values()
                    ):
                        if (
                            subdomain_3[
                                "product_count"
                            ] <= 0
                        ):
                            continue

                        subdomain_3_data.append(
                            subdomain_3
                        )

                    subdomain_3_data.sort(
                        key=lambda item: (
                            -item[
                                "product_count"
                            ],
                            (
                                item[
                                    "name"
                                ]
                                or ""
                            ).lower(),
                        )
                    )

                    subdomain_2[
                        "subdomains"
                    ] = subdomain_3_data

                    subdomain_2_data.append(
                        subdomain_2
                    )

                subdomain_2_data.sort(
                    key=lambda item: (
                        -item[
                            "product_count"
                        ],
                        (
                            item["name"]
                            or ""
                        ).lower(),
                    )
                )

                domain[
                    "subdomains"
                ] = subdomain_2_data

                domain_data.append(
                    domain
                )

            domain_data.sort(
                key=lambda item: (
                    -item[
                        "product_count"
                    ],
                    (
                        item["name"]
                        or ""
                    ).lower(),
                )
            )

            return Response(
                {
                    "count": len(
                        domain_data
                    ),
                    "domains":
                        domain_data,
                },
                status=(
                    status.HTTP_200_OK
                ),
            )

        except Exception as exc:
            return Response(
                {
                    "error": str(exc),
                    "type":
                        type(exc).__name__,
                },
                status=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )


# ============================================================
# SEARCH SUGGESTIONS
# ============================================================

class SearchSuggestionsViewSet(
    viewsets.ViewSet
):
    renderer_classes = [
        renderers.JSONRenderer
    ]

    def list(
        self,
        request,
    ):
        try:
            data = hybrid_product_search(
                request
            )

            suggestions = []

            for product in data.get(
                "results",
                [],
            ):
                suggestions.append({
                    "id":
                        product.get("id"),

                    "name":
                        product.get("name"),

                    "slug":
                        product.get("slug"),

                    "sku":
                        product.get("sku"),

                    "short_desc":
                        product.get(
                            "short_desc"
                        ),

                    "domain":
                        product.get(
                            "domain"
                        ),

                    "subdomain_2":
                        product.get(
                            "subdomain_2"
                        ),

                    "subdomain_3":
                        product.get(
                            "subdomain_3"
                        ),

                    "datatype":
                        product.get(
                            "datatype"
                        ),

                    "classification":
                        product.get(
                            "classification"
                        ),

                    "data_steward":
                        product.get(
                            "data_steward"
                        ),

                    "poc_name":
                        product.get(
                            "poc_name"
                        ),

                    "business_contact":
                        product.get(
                            "business_contact"
                        ),

                    "business_sme":
                        product.get(
                            "business_sme"
                        ),

                    "images":
                        product.get(
                            "images",
                            [],
                        ),

                    "matched_on":
                        product.get(
                            "matched_on",
                            [],
                        ),

                    "relevance_score":
                        product.get(
                            "relevance_score"
                        ),
                })

            return Response(
                {
                    "query":
                        data.get(
                            "query",
                            "",
                        ),

                    "normalized_query":
                        data.get(
                            "normalized_query",
                            "",
                        ),

                    "search_query_used":
                        data.get(
                            "search_query_used",
                            "",
                        ),

                    "intent":
                        data.get(
                            "intent"
                        ),

                    "did_you_mean":
                        data.get(
                            "did_you_mean"
                        ),

                    "spelling_confidence":
                        data.get(
                            "spelling_confidence"
                        ),

                    "correction_applied":
                        data.get(
                            "correction_applied",
                            False,
                        ),

                    "count":
                        data.get(
                            "count",
                            0,
                        ),

                    "page":
                        data.get(
                            "page",
                            1,
                        ),

                    "page_size":
                        data.get(
                            "page_size",
                            8,
                        ),

                    "total_pages":
                        data.get(
                            "total_pages",
                            0,
                        ),

                    "has_previous":
                        data.get(
                            "has_previous",
                            False,
                        ),

                    "has_next":
                        data.get(
                            "has_next",
                            False,
                        ),

                    "suggestions":
                        suggestions,
                },
                status=(
                    status.HTTP_200_OK
                ),
            )

        except Exception as exc:
            return Response(
                {
                    "error": (
                        "Unable to retrieve "
                        "suggestions."
                    ),
                    "detail": str(exc),
                    "type":
                        type(exc).__name__,
                },
                status=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )


# ============================================================
# HYBRID PRODUCT SEARCH
# ============================================================

class HybridProductSearchViewSet(
    viewsets.ViewSet
):
    renderer_classes = [
        renderers.JSONRenderer
    ]

    def list(
        self,
        request,
    ):
        try:
            data = hybrid_product_search(
                request
            )

            return Response(
                data,
                status=(
                    status.HTTP_200_OK
                ),
            )

        except Exception as exc:
            return Response(
                {
                    "error": (
                        "Unable to search "
                        "products."
                    ),
                    "detail": str(exc),
                    "type":
                        type(exc).__name__,
                },
                status=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )