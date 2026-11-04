
from django.contrib import admin
from .models import InstalledThirdPartyApi,IntegrationAuditLog,IntegrationDailyMetric,IntegrationTestRun,IntegrationTestCheck

admin.site.register(InstalledThirdPartyApi);
admin.site.register(IntegrationAuditLog);
admin.site.register(IntegrationDailyMetric);
admin.site.register(IntegrationTestRun);
admin.site.register(IntegrationTestCheck)
