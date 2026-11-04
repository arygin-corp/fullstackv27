# backend/apps/marketplace/serializers.py

import html

from django.utils.html import strip_tags
from rest_framework import serializers

from apps.resources.models import Brand

from .models import (
    Datatype,
    Domain,
    EndToEndSolutionProduct,
    Product,
    ProductAssociation,
    SampleData,
    SubDomain_1,
    SubDomain_2,
)


# =============================================================
# Shared Helpers
# =============================================================

def clean_html(value):
    """
    Convert CKEditor/HTML content into plain text.
    """

    if not value:
        return ""

    clean_text = strip_tags(
        str(value)
    )

    return html.unescape(
        clean_text
    ).strip()


def get_product_images(
    product,
    request=None,
):
    """
    Return all available product images as URL strings.

    The Angular application expects `images` to be an array.
    """

    image_urls = []

    for product_image in product.images.all():
        image = getattr(
            product_image,
            "image",
            None,
        )

        if not image:
            continue

        image_url = image.url

        if request:
            image_url = (
                request.build_absolute_uri(
                    image_url
                )
            )

        image_urls.append(image_url)

    if image_urls:
        return image_urls

    default_url = (
        "/media/marketplace/products/"
        "default-product.png"
    )

    if request:
        default_url = (
            request.build_absolute_uri(
                default_url
            )
        )

    return [default_url]


# =============================================================
# Search
# =============================================================

class SearchQuerySerializer(
    serializers.Serializer
):
    query = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        max_length=255,
    )

    page = serializers.IntegerField(
        default=1,
        min_value=1,
    )

    limit = serializers.IntegerField(
        default=6,
        min_value=1,
        max_value=50,
    )


# =============================================================
# Taxonomy
# =============================================================

class DatatypeSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Datatype

        fields = (
            "id",
            "name",
            "value",
        )


class DomainSerializer(
    serializers.Serializer
):
    """
    Recursive serializer used for Domain, SubDomain_1,
    and SubDomain_2 records.
    """

    id = serializers.IntegerField()

    categoryID = serializers.IntegerField(
        source="id",
    )

    parentID = serializers.SerializerMethodField()

    name = serializers.CharField()

    slug = serializers.CharField()

    image = serializers.SerializerMethodField()

    desc = serializers.CharField(
        source="description",
        allow_null=True,
    )

    items = serializers.IntegerField(
        source="product_count",
        read_only=True,
    )

    product_count = serializers.IntegerField(
        read_only=True,
    )

    products = serializers.SerializerMethodField()

    subdomains = serializers.SerializerMethodField()

    def get_parentID(self, obj):
        if isinstance(obj, SubDomain_1):
            return obj.domain_id or 0

        if isinstance(obj, SubDomain_2):
            return obj.subdomain_1_id or 0

        return 0

    def get_image(self, obj):
        image = getattr(
            obj,
            "image",
            None,
        )

        if not image:
            return ""

        return image.url

    def get_products(self, obj):
        if isinstance(obj, Domain):
            products = (
                obj.product_domain
                .filter(
                    status="approved",
                )
                .only(
                    "name",
                    "slug",
                )
            )

        elif isinstance(obj, SubDomain_1):
            products = (
                obj.product_subdomain_2
                .filter(
                    status="approved",
                )
                .only(
                    "name",
                    "slug",
                )
            )

        elif isinstance(obj, SubDomain_2):
            products = (
                obj.product_subdomain_3
                .filter(
                    status="approved",
                )
                .only(
                    "name",
                    "slug",
                )
            )

        else:
            return []

        return [
            {
                "name": product.name,
                "slug": product.slug,
            }
            for product in products[:1]
        ]

    def get_subdomains(self, obj):
        prefetched_children = getattr(
            obj,
            "prefetched_subdomains",
            None,
        )

        if prefetched_children is not None:
            children = prefetched_children

        elif isinstance(obj, Domain):
            children = obj.domain.all()

        elif isinstance(obj, SubDomain_1):
            children = obj.subdomain_1.all()

        else:
            return []

        return DomainSerializer(
            children,
            many=True,
            context=self.context,
        ).data


class BrandSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Brand

        fields = (
            "id",
            "name",
            "image",
            "desc",
        )


# =============================================================
# Contacts and Sample Data
# =============================================================

class ContactSerializer(
    serializers.Serializer
):
    name = serializers.CharField()
    email = serializers.EmailField()


class SampleDataSerializer(
    serializers.ModelSerializer
):
    field_name_1 = serializers.StringRelatedField()
    field_value_1 = serializers.StringRelatedField()

    field_name_2 = serializers.StringRelatedField()
    field_value_2 = serializers.StringRelatedField()

    field_name_3 = serializers.StringRelatedField()
    field_value_3 = serializers.StringRelatedField()

    field_name_4 = serializers.StringRelatedField()
    field_value_4 = serializers.StringRelatedField()

    field_name_5 = serializers.StringRelatedField()
    field_value_5 = serializers.StringRelatedField()

    field_name_6 = serializers.StringRelatedField()
    field_value_6 = serializers.StringRelatedField()

    field_name_7 = serializers.StringRelatedField()
    field_value_7 = serializers.StringRelatedField()

    field_name_8 = serializers.StringRelatedField()
    field_value_8 = serializers.StringRelatedField()

    field_name_9 = serializers.StringRelatedField()
    field_value_9 = serializers.StringRelatedField()

    field_name_10 = serializers.StringRelatedField()
    field_value_10 = serializers.StringRelatedField()

    class Meta:
        model = SampleData
        fields = "__all__"


# =============================================================
# Lightweight Nested Product
# =============================================================

class AssociatedProductSummarySerializer(
    serializers.ModelSerializer
):
    """
    Lightweight nested Product serializer.

    This serializer intentionally does not contain
    `end_to_end_solution`. That prevents recursive serialization
    when End-to-End products contain other marketplace products.
    """

    short_desc = serializers.SerializerMethodField()

    brief_desc = serializers.SerializerMethodField()

    images = serializers.SerializerMethodField()

    datatype = serializers.CharField(
        source="datatype.name",
        read_only=True,
        allow_null=True,
    )

    domain = serializers.CharField(
        source="domain.name",
        read_only=True,
        allow_null=True,
    )

    classification = serializers.CharField(
        source="classification.name",
        read_only=True,
        allow_null=True,
    )

    data_steward = ContactSerializer(
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "price",
            "short_desc",
            "brief_desc",
            "data_steward",
            "domain",
            "datatype",
            "classification",
            "images",
        )

    def get_short_desc(self, obj):
        return clean_html(
            obj.short_desc
            or obj.brief_desc
        )

    def get_brief_desc(self, obj):
        return clean_html(
            obj.brief_desc
        )

    def get_images(self, obj):
        return get_product_images(
            obj,
            self.context.get("request"),
        )


# =============================================================
# End-to-End Solution
# =============================================================

class EndToEndSolutionProductSerializer(
    serializers.ModelSerializer
):
    """
    Serialize one ordered End-to-End membership record.
    """

    product = serializers.SerializerMethodField()

    displayOrder = serializers.IntegerField(
        source="position",
        read_only=True,
    )

    reason = serializers.SerializerMethodField()

    class Meta:
        model = EndToEndSolutionProduct

        fields = (
            "id",
            "product",
            "displayOrder",
            "reason",
        )

    def get_product(self, obj):
        return AssociatedProductSummarySerializer(
            obj.solution_product,
            context=self.context,
        ).data

    def get_reason(self, obj):
        return clean_html(
            obj.solution_product.short_desc
            or obj.solution_product.brief_desc
        )


# =============================================================
# Product
# =============================================================

class ProductSerializer(
    serializers.ModelSerializer
):
    short_desc = serializers.SerializerMethodField()

    brief_desc = serializers.SerializerMethodField()

    resource_url = serializers.SerializerMethodField()

    catalog = serializers.SerializerMethodField()

    images = serializers.SerializerMethodField()

    # This must be explicitly declared. It is not a physical
    # field on the Product model.
    end_to_end_solution = (
        serializers.SerializerMethodField()
    )

    domain_slug = serializers.CharField(
        source="domain.slug",
        read_only=True,
    )

    subdomain_2_slug = serializers.CharField(
        source="subdomain_2.slug",
        read_only=True,
    )

    subdomain_3_slug = serializers.CharField(
        source="subdomain_3.slug",
        read_only=True,
    )

    datatype_slug = serializers.CharField(
        source="datatype.slug",
        read_only=True,
    )

    org_slug = serializers.CharField(
        source="org.slug",
        read_only=True,
    )

    domain = serializers.CharField(
        source="domain.name",
        read_only=True,
    )

    subdomain_2 = serializers.CharField(
        source="subdomain_2.name",
        read_only=True,
    )

    subdomain_3 = serializers.CharField(
        source="subdomain_3.name",
        read_only=True,
    )

    datatype = serializers.CharField(
        source="datatype.name",
        read_only=True,
    )

    classification = serializers.CharField(
        source="classification.name",
        read_only=True,
    )

    org = serializers.CharField(
        source="org.name",
        read_only=True,
    )

    org_abbrev = serializers.CharField(
        source="org.abbrev",
        read_only=True,
    )

    one_ts_domain = serializers.CharField(
        source="one_ts_domain.name",
        read_only=True,
    )

    platform = serializers.CharField(
        source="platform.name",
        read_only=True,
    )

    ad_group = serializers.CharField(
        source="ad_group.name",
        read_only=True,
        allow_null=True,
    )

    fulfillment_group = serializers.CharField(
        source="fulfillment_group.name",
        read_only=True,
        allow_null=True,
    )

    data_steward = ContactSerializer(
        read_only=True,
    )

    poc_name = ContactSerializer(
        read_only=True,
    )

    business_contact = ContactSerializer(
        source="business_contact_name",
        read_only=True,
    )

    business_sme = ContactSerializer(
        read_only=True,
    )

    badges = serializers.StringRelatedField(
        many=True,
        source="badge",
    )

    keywords = serializers.StringRelatedField(
        many=True,
        source="keyword",
    )

    sample_data = SampleDataSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "catalog",
            "short_desc",
            "brief_desc",
            "resource_url",
            "original_name",
            "price",
            "pi",
            "sensitive_pi",
            "usertype",
            "access_type",
            "environment",
            "data_access_type",
            "availability",
            "frequency",
            "hide_me",
            "max",
            "is_active",
            "data_review_required",
            "data_review_status",
            "data_review_team",
            "cwpg_status",
            "status",
            "domain",
            "subdomain_2",
            "subdomain_3",
            "datatype",
            "classification",
            "org",
            "org_abbrev",
            "route_identifier",
            "one_ts_domain",
            "platform",
            "ad_group",
            "fulfillment_group",
            "data_steward",
            "poc_name",
            "business_contact",
            "business_sme",
            "badges",
            "keywords",
            "sample_data",
            "images",
            "domain_slug",
            "subdomain_2_slug",
            "subdomain_3_slug",
            "datatype_slug",
            "org_slug",
            "end_to_end_solution",
        )

    def get_end_to_end_solution(self, obj):
        """
        Return the direct Product-to-Product End-to-End solution.

        This uses the EndToEndSolutionProduct.product relationship
        with related_name="end_to_end_products".
        """

        entries = (
            obj.end_to_end_products
            .select_related(
                "solution_product",
                "solution_product__datatype",
                "solution_product__domain",
                (
                    "solution_product__"
                    "classification"
                ),
                (
                    "solution_product__"
                    "data_steward"
                ),
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

        return {
            "id": obj.id,
            "name": (
                f"{obj.name} "
                "End-to-End Solution"
            ),
            "description": clean_html(
                obj.short_desc
                or obj.brief_desc
                or ""
            ),
            "status": "published",
            "products": (
                EndToEndSolutionProductSerializer(
                    entries,
                    many=True,
                    context=self.context,
                ).data
            ),
        }

    def get_short_desc(self, obj):
        return clean_html(
            obj.short_desc
        )

    def get_brief_desc(self, obj):
        return clean_html(
            obj.brief_desc
        )

    def get_catalog(self, obj):
        return clean_html(
            obj.catalog
        )

    def get_resource_url(self, obj):
        return obj.resource_url or ""

    def get_images(self, obj):
        return get_product_images(
            obj,
            self.context.get("request"),
        )


# =============================================================
# Product Suggestions
# =============================================================

class ProductSuggestionSerializer(
    serializers.ModelSerializer
):
    short_desc = serializers.SerializerMethodField()

    images = serializers.SerializerMethodField()

    datatype = serializers.CharField(
        source="datatype.name",
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "short_desc",
            "datatype",
            "images",
        )

    def get_short_desc(self, obj):
        text = clean_html(
            obj.short_desc
        )

        if len(text) > 120:
            return (
                text[:120].rstrip()
                + "..."
            )

        return text

    def get_images(self, obj):
        return get_product_images(
            obj,
            self.context.get("request"),
        )


# =============================================================
# Product Associations
# =============================================================

class ProductAssociationSerializer(
    serializers.ModelSerializer
):
    associated_product = (
        AssociatedProductSummarySerializer(
            read_only=True,
        )
    )

    association_type = serializers.CharField(
        read_only=True,
    )

    badge_label = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = ProductAssociation

        fields = (
            "id",
            "associated_product",
            "association_type",
            "badge_label",
            "is_related",
            "is_additional",
            "reason",
            "position",
        )