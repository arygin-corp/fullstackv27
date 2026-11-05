from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from .models import Brand, Document, Homepage, Media, Policie, Processe, ResourceAnalytics, ResourceApprovalAudit, ResourceChangeAttachment, ResourceChangeRequest, ResourceVersion
from .services.core import archive_resource, publish_resource, restore_resource

class ResourceAdmin(admin.ModelAdmin):
    list_display=('__str__','is_active','is_archived','publish_at','expire_at'); list_filter=('is_active','is_archived'); actions=('archive_selected','restore_selected')
    def save_model(self,request,obj,form,change):
        if not change and not obj.created_by_id: obj.created_by=request.user
        obj.updated_by=request.user
        if isinstance(obj,Homepage) and obj.is_active: publish_resource(obj,request.user)
        else: obj.full_clean(); super().save_model(request,obj,form,change)
    @admin.action(description='Archive selected resources')
    def archive_selected(self,request,queryset):
        for obj in queryset: archive_resource(obj,request.user)
    @admin.action(description='Restore selected resources')
    def restore_selected(self,request,queryset):
        for obj in queryset: restore_resource(obj,request.user)
for model in (Homepage,Brand,Document,Policie,Processe,Media): admin.site.register(model,ResourceAdmin)

@admin.register(ResourceChangeRequest)
class ChangeRequestAdmin(admin.ModelAdmin):
    list_display=('id','resource_type','resource_id','action','status','submitter','approver'); readonly_fields=('submitted_at','decided_at','applied_at','created_at','updated_at')
    def delete_model(self,request,obj): raise ValidationError('Hard delete is prohibited.')
@admin.register(ResourceApprovalAudit)
class AuditAdmin(admin.ModelAdmin):
    list_display=('event','actor','timestamp'); readonly_fields=[f.name for f in ResourceApprovalAudit._meta.fields]
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
@admin.register(ResourceVersion)
class VersionAdmin(admin.ModelAdmin):
    list_display=('resource_type','resource_id','version_number','created_by','created_at'); readonly_fields=[f.name for f in ResourceVersion._meta.fields]
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
admin.site.register(ResourceChangeAttachment)
admin.site.register(ResourceAnalytics)
