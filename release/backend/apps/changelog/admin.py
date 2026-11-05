from django.contrib import admin

from .models import AuditLog, Categorie, Notification, Post, ReleaseSubscription


class AuditFieldsAdmin(admin.ModelAdmin):
    readonly_fields = ("created_by", "created_at", "updated_by", "updated_at")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Post)
class PostAdmin(AuditFieldsAdmin):
    list_display = ("version", "title", "release_date", "status", "publish_at", "updated_by")
    list_filter = ("status", "release_date", "publish_at")
    search_fields = ("version", "title", "desc")
    readonly_fields = AuditFieldsAdmin.readonly_fields + (
        "submitted_by", "submitted_at", "approved_by", "approved_at", "published_at", "is_active"
    )


@admin.register(Categorie)
class CategorieAdmin(AuditFieldsAdmin):
    list_display = ("name", "slug", "is_active", "created_by", "updated_by")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "desc")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "post", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("user__username", "post__version", "title")
    readonly_fields = tuple(field.name for field in Notification._meta.fields)


@admin.register(ReleaseSubscription)
class ReleaseSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "email_enabled", "in_app_enabled", "updated_at")
    list_filter = ("email_enabled", "in_app_enabled")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor_username", "action", "model_name", "object_id", "request_method")
    list_filter = ("action", "model_name", "created_at")
    search_fields = ("actor_username", "actor_email", "object_id", "object_repr", "request_path")
    readonly_fields = tuple(field.name for field in AuditLog._meta.fields)
    ordering = ("-created_at",)

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False
