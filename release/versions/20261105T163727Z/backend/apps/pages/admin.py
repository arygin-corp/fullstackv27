from django.contrib import admin
from .models import ContentBlock, Page, PageType, PageVersion
class ContentBlockInline(admin.TabularInline):
    model=ContentBlock; extra=0; fields=("position","block_type","label","is_enabled","checksum"); readonly_fields=("checksum",); ordering=("position",)
@admin.register(PageType)
class PageTypeAdmin(admin.ModelAdmin): list_display=("name","code","is_active","allow_restricted_html"); list_filter=("is_active","allow_restricted_html"); search_fields=("name","code")
@admin.register(Page)
class PageAdmin(admin.ModelAdmin): list_display=("title","slug","page_type","locale"); list_filter=("page_type","locale"); search_fields=("title","slug")
@admin.register(PageVersion)
class PageVersionAdmin(admin.ModelAdmin): list_display=("page","number","status","updated_at"); list_filter=("status",); inlines=(ContentBlockInline,)
@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin): list_display=("version","position","block_type","label","is_enabled"); list_filter=("block_type","is_enabled"); readonly_fields=("checksum",)
from .models import Approval,AuditEvent,LifecycleRequest,MediaAsset,NotificationDelivery,NotificationPreference,ReviewRequirement,ScheduledPublication,WorkflowTask
for model in (ReviewRequirement,Approval,WorkflowTask,LifecycleRequest,NotificationDelivery,NotificationPreference,MediaAsset,ScheduledPublication):
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass
@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display=("created_at","action","page_slug_snapshot","actor")
    readonly_fields=("page","page_slug_snapshot","version_number","action","actor","details","created_at")
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
