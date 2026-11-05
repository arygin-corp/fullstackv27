from django.contrib import admin
from .access import can_view_audit
from .models import IntakeApprovalEvent, IntakeProductTags, IntakeSecurityEvent, NotificationOutbox, ProductIntake, ProductIntakeAuditLog, UserNotification

@admin.register(IntakeProductTags)
class TagAdmin(admin.ModelAdmin):
    list_display=("name","is_active","updated_at")

@admin.register(ProductIntake)
class IntakeAdmin(admin.ModelAdmin):
    list_display=("id","product_name","requester_email","status","marketplace_product","created_at")
    list_filter=("status","product_pii","product_spi")
    search_fields=("product_name","requester_email","submitted_by_email")
    readonly_fields=("marketplace_product","submitted_at","assigned_at","review_started_at","decision_at","implemented_at","created_at","updated_at")
    def has_delete_permission(self,request,obj=None): return False

class ImmutableAdmin(admin.ModelAdmin):
    def has_module_permission(self,request): return can_view_audit(request.user)
    def has_view_permission(self,request,obj=None): return can_view_audit(request.user)
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
    def get_actions(self,request): return {}

@admin.register(ProductIntakeAuditLog)
class AuditAdmin(ImmutableAdmin): pass
@admin.register(IntakeSecurityEvent)
class SecurityAdmin(ImmutableAdmin): pass
admin.site.register(IntakeApprovalEvent)
admin.site.register(UserNotification)
admin.site.register(NotificationOutbox)
