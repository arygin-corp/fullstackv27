
from django.contrib import admin
from django.utils import timezone
from .models import InstalledThirdPartyApi,IntegrationAuditLog,IntegrationDailyMetric,IntegrationTestRun,IntegrationTestCheck


@admin.register(InstalledThirdPartyApi)
class InstalledThirdPartyApiAdmin(admin.ModelAdmin):
    readonly_fields = ("last_success_at", "updated_at")

    def save_model(self, request, obj, form, change):
        obj.last_success_at = timezone.now()
        super().save_model(request, obj, form, change)

admin.site.register(IntegrationAuditLog);
admin.site.register(IntegrationDailyMetric);
admin.site.register(IntegrationTestRun);
admin.site.register(IntegrationTestCheck)
