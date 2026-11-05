from django.contrib import admin
from .models import APIConfiguration, APIHealthCheck, APIKey, APIParameter, APIRequestAudit, ConfigurationRevision, EndpointGrant, FrontendApplication, IdempotencyRecord, PublishedEndpoint
class ParameterInline(admin.TabularInline): model = APIParameter; extra = 0
@admin.register(APIConfiguration)
class APIConfigurationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "version", "environment", "api_key_enabled", "lifecycle", "active", "updated_at"); list_filter = ("environment", "api_key_enabled", "lifecycle", "active", "http_method"); search_fields = ("name", "slug", "owner_team"); inlines = (ParameterInline,)
@admin.register(PublishedEndpoint)
class PublishedEndpointAdmin(admin.ModelAdmin): list_display = ("name", "public_version", "public_slug", "target_type", "authentication_mode", "enabled")
@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin): list_display = ("name", "application", "prefix", "activates_at", "expires_at", "revoked_at", "last_used_at"); readonly_fields = ("secret_hash", "prefix", "created_at", "last_used_at", "last_used_ip")
@admin.register(APIRequestAudit)
class APIRequestAuditAdmin(admin.ModelAdmin):
    list_display = ("created_at", "direction", "status", "api_configuration", "published_endpoint", "correlation_id"); readonly_fields = tuple(field.name for field in APIRequestAudit._meta.fields)
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False
for model in (APIHealthCheck, ConfigurationRevision, EndpointGrant, FrontendApplication, IdempotencyRecord): admin.site.register(model)
