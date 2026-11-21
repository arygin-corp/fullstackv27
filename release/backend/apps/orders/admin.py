from django.contrib import admin
from .models import MarketplaceOrder, Request, ServiceNowSyncAudit, SyncCursor, Task, UserActivity


class RequestInline(admin.TabularInline):
    model = Request
    extra = 0
    fields = ("number", "ritm_number", "ritm_id", "object_id", "ritm_state", "stage")
    readonly_fields = fields
    show_change_link = True


@admin.register(MarketplaceOrder)
class MarketplaceOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "marketplace_order_id", "sync_status", "last_synced_at", "created_at")
    search_fields = ("marketplace_order_id",)
    list_filter = ("sync_status",)
    inlines = (RequestInline,)


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ("number", "state", "assignment_group", "assigned_to", "due")
    readonly_fields = fields


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ("number", "ritm_number", "marketplace_order", "object_id", "product_id", "ritm_state", "stage")
    search_fields = ("number", "ritm_number", "ritm_id", "object_id", "marketplace_order__marketplace_order_id")
    list_filter = ("approval_stage", "ritm_state", "stage")
    inlines = (TaskInline,)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("number", "request", "state", "assignment_group", "assigned_to", "due")
    search_fields = ("number", "request__number", "request__ritm_number")
    list_filter = ("state", "assignment_group")


admin.site.register(SyncCursor)
admin.site.register(ServiceNowSyncAudit)


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "title", "detail", "reference", "email")
    search_fields = ("action", "detail", "reference", "email", "object_id")
    list_filter = ("action",)
    readonly_fields = ("object_id", "email", "action", "title", "detail", "reference", "payload", "created_at")
