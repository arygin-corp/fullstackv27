from django.contrib import admin

from .models import (
    ProductApproval,
    ProductCheckoutCondition,
    ProductCheckoutConfiguration,
    ProductCheckoutFieldAction,
    ProductCheckoutRequest,
    ProductCheckoutRoutingRule,
    ProductCheckoutRule,
    ProductCheckoutRuleGroup,
    ProductCheckoutValidationRule,
    ProductFulfillment,
    ProductQuestion,
    ProductQuestionOption,
)


class OptionInline(admin.TabularInline):
    model = ProductQuestionOption
    extra = 0


@admin.register(ProductQuestion)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        "key", "label", "configuration", "field_type", "required",
        "order", "is_active",
    )
    list_filter = ("field_type", "required", "is_active")
    search_fields = ("key", "label", "configuration__product_ref")
    inlines = (OptionInline,)


class QuestionInline(admin.TabularInline):
    model = ProductQuestion
    extra = 0
    show_change_link = True


class LegacyRuleInline(admin.TabularInline):
    model = ProductCheckoutRule
    extra = 0


@admin.register(ProductCheckoutConfiguration)
class ConfigAdmin(admin.ModelAdmin):
    list_display = (
        "product_ref", "product_model", "is_active", "allow_other_user",
        "allow_service_account", "requires_manager_approval",
    )
    search_fields = ("product_ref", "product_model")
    list_filter = (
        "is_active", "allow_other_user", "allow_service_account",
        "requires_manager_approval",
    )
    inlines = (QuestionInline, LegacyRuleInline)


class ConditionInline(admin.TabularInline):
    model = ProductCheckoutCondition
    extra = 0


class FieldActionInline(admin.TabularInline):
    model = ProductCheckoutFieldAction
    extra = 0


@admin.register(ProductCheckoutRuleGroup)
class RuleGroupAdmin(admin.ModelAdmin):
    list_display = (
        "name", "configuration", "evaluation_mode", "priority", "is_active",
    )
    list_filter = ("configuration", "evaluation_mode", "is_active")
    search_fields = ("name", "configuration__product_ref")
    inlines = (ConditionInline, FieldActionInline)


@admin.register(ProductCheckoutFieldAction)
class FieldActionAdmin(admin.ModelAdmin):
    list_display = (
        "group", "target_key", "action_type", "order", "is_active",
    )
    list_filter = ("action_type", "is_active", "group__configuration")
    search_fields = ("target_key", "group__name")


@admin.register(ProductCheckoutValidationRule)
class ValidationRuleAdmin(admin.ModelAdmin):
    list_display = (
        "field_key", "validation_type", "configuration", "order", "is_active",
    )
    list_filter = ("validation_type", "is_active", "configuration")
    search_fields = ("field_key", "error_message", "configuration__product_ref")


@admin.register(ProductCheckoutRoutingRule)
class RoutingRuleAdmin(admin.ModelAdmin):
    list_display = (
        "name", "configuration", "route_identifier", "fulfillment_group",
        "priority", "is_active",
    )
    list_filter = ("is_active", "configuration", "stop_processing")
    search_fields = ("name", "route_identifier", "fulfillment_group")


@admin.register(ProductCheckoutRequest)
class RequestAdmin(admin.ModelAdmin):
    list_display = (
        "request_number", "product_ref", "requestor", "request_type",
        "status", "submitted_at",
    )
    list_filter = ("status", "request_type")
    search_fields = (
        "request_number", "product_ref", "requestor__username",
        "requestor__email",
    )
    readonly_fields = (
        "request_number", "product_snapshot", "requestor_snapshot",
        "submitted_at", "metadata",
    )


admin.site.register(ProductCheckoutRule)
admin.site.register(ProductApproval)
admin.site.register(ProductFulfillment)
