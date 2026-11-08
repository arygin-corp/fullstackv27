from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet
from .models import (
    ADGroup,
    Attribute,
    AttributeType,
    Badge,
    Catalog,
    Classification,
    Company,
    Contact,
    AlternateApprover,
    DataSteward,
    Datatype,
    Domain,
    EndToEndSolutionProduct,
    FulfillmentTeam,
    Keyword,
    OneTSDomain,
    Organization,
    Platform,
    Product,
    ProductImage,
    ProductAssociation,
    Review,
    SubDomain_1,
    SubDomain_2,
)

# =============================================================
# Product Association Inline FormSet
# =============================================================

class ProductAssociationInlineFormSet(BaseInlineFormSet):
    """
    Validation and automatic positioning for ProductAssociation.

    Rules:
    - Maximum of 15 active associations.
    - Prevent self-association.
    - Prevent duplicate associated products.
    - Require Related, Similar, or both.
    - Automatically assign the next position to new associations.
    """

    MAX_ASSOCIATED_PRODUCTS = 15

    def clean(self):
        super().clean()

        # Don't run cross-form validation when Django has
        # already detected individual form errors.
        if any(self.errors):
            return

        seen_product_ids = set()
        active_rows = 0

        for form in self.forms:
            cleaned_data = getattr(
                form,
                "cleaned_data",
                None
            )

            if not cleaned_data:
                continue

            # Ignore rows marked for deletion.
            if cleaned_data.get("DELETE"):
                continue

            associated_product = cleaned_data.get(
                "associated_product"
            )

            # Ignore unused extra inline rows.
            if associated_product is None:
                continue

            active_rows += 1

            associated_product_id = associated_product.pk

            is_related = cleaned_data.get(
                "is_related",
                False
            )

            is_additional = cleaned_data.get(
                "is_additional",
                False
            )

            # -----------------------------------------------------
            # Prevent self association
            # -----------------------------------------------------

            if (
                self.instance.pk
                and associated_product_id == self.instance.pk
            ):
                form.add_error(
                    "associated_product",
                    "A product cannot be associated with itself."
                )

            # -----------------------------------------------------
            # Prevent duplicates
            # -----------------------------------------------------

            if associated_product_id in seen_product_ids:
                form.add_error(
                    "associated_product",
                    "This product is selected more than once."
                )
            else:
                seen_product_ids.add(
                    associated_product_id
                )

            # -----------------------------------------------------
            # Require association type
            # -----------------------------------------------------

            if not is_related and not is_additional:
                form.add_error(
                    "is_related",
                    "Select Related, Similar, or both."
                )

        # ---------------------------------------------------------
        # Maximum 15
        # ---------------------------------------------------------

        if active_rows > self.MAX_ASSOCIATED_PRODUCTS:
            raise ValidationError(
                "A product can have a maximum of "
                f"{self.MAX_ASSOCIATED_PRODUCTS} "
                "associated products."
            )

    # =========================================================
    # Automatic Position Assignment
    # =========================================================

    def save_new(self, form, commit=True):
        """
        Save a new association using the next available position.

        Example:

        Existing:
            1
            2
            3
            4
            5

        New association:
            6

        Next association:
            7
        """

        instance = form.save(
            commit=False
        )

        # Only assign automatically when a position
        # has not already been assigned.
        if not instance.position:

            highest_position = (
                self.model.objects
                .filter(
                    product=self.instance
                )
                .order_by("-position")
                .values_list(
                    "position",
                    flat=True
                )
                .first()
            )

            next_position = (
                highest_position or 0
            ) + 1

            instance.position = next_position

        if commit:
            instance.save()

        return instance


# =============================================================
# Product Association Inline
# =============================================================

class ProductAssociationInline(admin.TabularInline):

    model = ProductAssociation

    fk_name = "product"

    formset = ProductAssociationInlineFormSet

    # Show one empty row at a time.
    extra = 1

    # Maximum association count.
    max_num = 15

    validate_max = True

    autocomplete_fields = (
        "associated_product",
    )

    fields = (
        "associated_product",
        "is_related",
        "is_additional",
        "badge_label_display",
        "reason",
        "position_display",
    )

    readonly_fields = (
        "badge_label_display",
        "position_display",
    )

    ordering = (
        "position",
    )

    @admin.display(description="Badge")
    def badge_label_display(self, obj):

        if obj and obj.pk:
            return obj.badge_label

        return "Determined by selection"

    @admin.display(description="Position")
    def position_display(self, obj):

        if obj and obj.position:
            return obj.position

        return "Automatic"


# =============================================================
# End-to-End Solution Inline FormSet
# =============================================================
class EndToEndSolutionProductInlineFormSet(
    BaseInlineFormSet
):
    """
    Validation and automatic positioning for End-to-End products.

    Rules:
    - Maximum of 15 products.
    - Prevent inclusion of the parent product.
    - Prevent duplicate products.
    - Automatically assign the next available position.
    """

    MAX_PRODUCTS = 15

    def clean(self):
        super().clean()

        if any(self.errors):
            return

        seen_product_ids = set()
        active_rows = 0

        for form in self.forms:
            cleaned_data = getattr(
                form,
                "cleaned_data",
                None,
            )

            if not cleaned_data:
                continue

            if cleaned_data.get("DELETE"):
                continue

            solution_product = cleaned_data.get(
                "solution_product"
            )

            if solution_product is None:
                continue

            active_rows += 1
            solution_product_id = solution_product.pk

            if (
                self.instance.pk and
                solution_product_id == self.instance.pk
            ):
                form.add_error(
                    "solution_product",
                    "A product cannot include itself in "
                    "its End-to-End solution.",
                )

            if solution_product_id in seen_product_ids:
                form.add_error(
                    "solution_product",
                    "This product is selected more "
                    "than once.",
                )
            else:
                seen_product_ids.add(
                    solution_product_id
                )

        if active_rows > self.MAX_PRODUCTS:
            raise ValidationError(
                "A product can have a maximum of "
                f"{self.MAX_PRODUCTS} End-to-End products."
            )

    def save_new(self, form, commit=True):
        instance = form.save(commit=False)

        if not instance.position:
            highest_position = (
                self.model.objects
                .filter(product=self.instance)
                .order_by("-position")
                .values_list(
                    "position",
                    flat=True,
                )
                .first()
            )

            instance.position = (
                highest_position or 0
            ) + 1

        if commit:
            instance.save()

        return instance


# =============================================================
# End-to-End Solution Inline
# =============================================================
class EndToEndSolutionProductInline(
    admin.TabularInline
):
    model = EndToEndSolutionProduct
    fk_name = "product"

    formset = EndToEndSolutionProductInlineFormSet

    extra = 1
    max_num = 15
    validate_max = True

    autocomplete_fields = (
        "solution_product",
    )

    fields = (
        "solution_product",
        "product_description",
        "position_display",
    )

    readonly_fields = (
        "product_description",
        "position_display",
    )

    ordering = (
        "position",
        "id",
    )

    verbose_name = "End-to-End product"
    verbose_name_plural = "END-TO-END SOLUTION"

    @admin.display(description="Short Description")
    def product_description(self, obj):
        if not obj or not obj.solution_product_id:
            return ""

        product = obj.solution_product

        return (
                product.short_desc or
                product.brief_desc or
                ""
        )

    @admin.display(description="Position")
    def position_display(self, obj):
        if obj and obj.position:
            return obj.position

        return "Automatic"


# =============================================================
# Domain
# =============================================================

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "level",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# SubDomain 1
# =============================================================

@admin.register(SubDomain_1)
class SubDomain1Admin(admin.ModelAdmin):

    list_display = (
        "name",
        "level",
        "domain",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# SubDomain 2
# =============================================================

@admin.register(SubDomain_2)
class SubDomain2Admin(admin.ModelAdmin):

    list_display = (
        "name",
        "level",
        "subdomain_1",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Datatype
# =============================================================

@admin.register(Datatype)
class DatatypeAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "value",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Classification
# =============================================================

@admin.register(Classification)
class ClassificationAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "value",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Contact
# =============================================================

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "email",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Catalog
# =============================================================

@admin.register(Catalog)
class CatalogAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Badge
# =============================================================

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Platform
# =============================================================

@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Organization
# =============================================================

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "abbrev",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Company
# =============================================================

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "abbrev",
        "org",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Data Steward
# =============================================================

@admin.register(DataSteward)
class DataStewardAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "email",
        "company_id",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Keyword
# =============================================================

@admin.register(Keyword)
class KeywordAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Attribute Type
# =============================================================

@admin.register(AttributeType)
class AttributeTypeAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Attribute
# =============================================================

@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "type",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# OneTS Domain
# =============================================================

@admin.register(OneTSDomain)
class OneTSDomainAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "control_group",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# AD Group
# =============================================================

@admin.register(ADGroup)
class ADGroupAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "value",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Alternate Approver
# =============================================================

@admin.register(AlternateApprover)
class AlternateApproverAdmin(admin.ModelAdmin):
    search_fields = ("name", "sys_id")
    list_display = ("name", "sys_id")


# =============================================================
# Fulfillment Team
# =============================================================

@admin.register(FulfillmentTeam)
class FulfillmentTeamAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "route_id",
        "is_active",
    )

    readonly_fields = (
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
    )


# =============================================================
# Product Image Inline
# =============================================================

class ProductImageInline(admin.TabularInline):

    model = ProductImage

    extra = 0


# =============================================================
# Product
# =============================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ("name","sku",)
    list_filter = ("status", "is_active",)

    # ---------------------------------------------------------
    # Edit Form Sections
    # ---------------------------------------------------------

    fieldsets = (
        (
            "General Information",
            {
                "fields": (
                    "name",
                    "domain",
                    "subdomain_2",
                    "subdomain_3",
                    "datatype",
                    "catalog",
                    "classification",
                    "data_steward",
                    "alt_approver",
                    "poc_name",
                    "business_contact_name",
                    "business_sme",
                    "status",
                    "brief_desc",
                    "whats_included",
                    "intended_use_desc",
                    "short_desc",
                    "intended_use",
                    "is_active",
                    "team",
                )
            }
        ),

        (
            "Resources & Organization",
            {
                "fields": (
                    "resource_url",
                    "org",
                    "pi",
                    "sensitive_pi",
                )
            }
        ),

        (
            "Tags & Metadata",
            {
                "fields": (
                    "badge",
                    "keyword",
                    "attribute",
                )
            }
        ),

        (
            "Uneditable Fields",
            {
                "fields": (
                    "slug",
                    "sku",
                    "price",
                    "usertype",
                    "access_type",
                    "environment",
                    "data_access_type",
                    "availability",
                    "frequency",
                    "hide_me",
                    "max",
                    "created_at",
                    "updated_at",
                ),

                "classes": (
                    "collapse",
                ),
            }
        ),
    )

    # ---------------------------------------------------------
    # Read-only Fields
    # ---------------------------------------------------------

    readonly_fields = (
        "slug",
        "sku",
        "price",
        "usertype",
        "access_type",
        "environment",
        "data_access_type",
        "availability",
        "frequency",
        "hide_me",
        "max",
        "created_at",
        "updated_at",
    )

    # ---------------------------------------------------------
    # Many-to-Many Widgets
    # ---------------------------------------------------------

    filter_horizontal = (
        "badge",
        "keyword",
        "attribute",
    )

    # ---------------------------------------------------------
    # Ordering
    # ---------------------------------------------------------

    ordering = (
        "id",
    )

    # ---------------------------------------------------------
    # Inline Forms
    # ---------------------------------------------------------

    inlines = (
        ProductImageInline,
        ProductAssociationInline,
        EndToEndSolutionProductInline,
    )

# =============================================================
# Product Image
# =============================================================

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "alt_text",
    )


# =============================================================
# Review
# =============================================================

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "author",
        "rating",
        "title",
        "status",
        "verified_purchaser",
        "created_at",
    )

    list_filter = ("status",)
    actions = ("approve_reviews", "reject_reviews")

    readonly_fields = (
        "created_at",
        "verified_purchaser",
    )

    def _content_manager(self, request):
        user = request.user
        return user.is_superuser or user.groups.filter(name="Content Manager Group").exists()

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        if not self._content_manager(request):
            self.message_user(request, "Only the Content Manager Group can approve reviews.", level=messages.ERROR)
            return
        reviews = list(queryset.select_related("author", "product"))
        updated = queryset.update(status="approved")
        from apps.notifications.services.work import notify_review_decision
        for review in reviews:
            review.status = "approved"
            notify_review_decision(review)
        self.message_user(request, f"{updated} review(s) approved and published.")

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        if not self._content_manager(request):
            self.message_user(request, "Only the Content Manager Group can reject reviews.", level=messages.ERROR)
            return
        reviews = list(queryset.select_related("author", "product"))
        updated = queryset.update(status="rejected")
        from apps.notifications.services.work import notify_review_decision
        for review in reviews:
            review.status = "rejected"
            notify_review_decision(review)
        self.message_user(request, f"{updated} review(s) rejected.")

class EndToEndSolutionProductInline(admin.TabularInline):
    model = EndToEndSolutionProduct
    fk_name = "product"
    extra = 1
    fields = ("solution_product", "product_description","position",)
    readonly_fields = ("product_description",)

    verbose_name = "End-to-End product"
    verbose_name_plural = "END-TO-END SOLUTION"
    ordering = ("position","id",)

    def product_description(self, obj):
        if (
            obj and
            obj.solution_product
        ):
            return (
                obj.solution_product.description
                or ""
            )

        return ""

    product_description.short_description = ( "PRODUCT DESCRIPTION")