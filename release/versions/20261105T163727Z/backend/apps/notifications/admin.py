from django.contrib import admin, messages
from .models import AuditLedgerCheckpoint, AuditLedgerEntry, AuditLedgerVerification, ChaosExperimentRecord, FatigueDecision, NotificationBundle, NotificationFatigueAssessment, NotificationPriorityAssessment, PriorityPolicy, ApplicationEnvironment, AudienceCondition, AudienceSnapshot, AudienceSnapshotMember, DynamicAudience, NotificationTenant, RegisteredApplication, TenantMembership, NotificationEvent, NotificationEventCheckpoint, PushDeliveryReceipt, PushDevice, NotificationSummary, CampaignRecipient, NotificationCampaign, NotificationTemplate, NotificationTemplateVersion, Notification, NotificationAuditEvent, NotificationDeadLetter, NotificationDelivery, NotificationDigest, NotificationMetric, NotificationOutbox, NotificationPreference, NotificationRule, TeamsDestination
from .services.outbox import requeue_dead_letter

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display=("recipient","notification_type","title","read","created_at"); list_filter=("notification_type","read","is_deleted","created_at"); search_fields=("title","body","recipient__username","correlation_id","idempotency_key"); list_select_related=("recipient",); readonly_fields=("correlation_id","created_at","updated_at")

@admin.register(NotificationOutbox)
class NotificationOutboxAdmin(admin.ModelAdmin):
    list_display=("event_id","notification","event_type","status","attempt_count","available_at","processed_at")
    list_filter=("status","event_type"); search_fields=("event_id","notification__correlation_id","last_error_code"); readonly_fields=("event_id","notification","event_type","payload","attempt_count","created_at","updated_at")

@admin.action(description="Requeue selected dead letters")
def requeue_selected(modeladmin, request, queryset):
    count=0
    for item in queryset.filter(status="open"):
        requeue_dead_letter(item,actor=request.user); count+=1
    modeladmin.message_user(request,f"Requeued {count} dead-letter item(s).",messages.SUCCESS)

@admin.register(NotificationDeadLetter)
class NotificationDeadLetterAdmin(admin.ModelAdmin):
    list_display=("id","notification","event_type","channel","failure_code","retry_count","status","last_attempt_at")
    list_filter=("status","channel","failure_code"); search_fields=("notification__correlation_id","failure_reason","failure_code"); readonly_fields=("outbox_event","notification","event_type","payload","failure_reason","failure_code","retry_count","first_failed_at","last_attempt_at","created_at","updated_at"); actions=(requeue_selected,)

for model in [NotificationSummary, NotificationTemplate, NotificationTemplateVersion, NotificationCampaign, CampaignRecipient, NotificationPreference,NotificationDelivery,NotificationAuditEvent,NotificationMetric,NotificationDigest,NotificationRule]: admin.site.register(model)


@admin.register(NotificationEvent)
class NotificationEventAdmin(admin.ModelAdmin):
    list_display=("event_id","aggregate_type","aggregate_id","aggregate_version","event_type","occurred_at")
    list_filter=("aggregate_type","event_type","schema_version"); search_fields=("event_id","aggregate_id","correlation_id"); readonly_fields=[f.name for f in NotificationEvent._meta.fields]
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False

@admin.register(PushDevice)
class PushDeviceAdmin(admin.ModelAdmin):
    list_display=("user","provider","platform","device_identifier","is_active","failure_count","updated_at")
    list_filter=("provider","platform","is_active"); search_fields=("user__username","device_identifier","application_identifier"); exclude=("token_encrypted",); readonly_fields=("token_digest","created_at","updated_at")

admin.site.register(NotificationEventCheckpoint)
admin.site.register(PushDeliveryReceipt)

for model in [NotificationTenant, RegisteredApplication, ApplicationEnvironment, TenantMembership, DynamicAudience, AudienceCondition, AudienceSnapshot, AudienceSnapshotMember]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass

for model in [PriorityPolicy, NotificationPriorityAssessment, NotificationFatigueAssessment, NotificationBundle]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass


@admin.register(AuditLedgerEntry)
class AuditLedgerEntryAdmin(admin.ModelAdmin):
    list_display=("sequence","event_type","aggregate_type","aggregate_id","correlation_id","occurred_at")
    list_filter=("event_type","aggregate_type"); search_fields=("entry_hash","aggregate_id","correlation_id"); readonly_fields=[f.name for f in AuditLedgerEntry._meta.fields]
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False

for model in [AuditLedgerCheckpoint, AuditLedgerVerification, ChaosExperimentRecord]:
    try: admin.site.register(model)
    except admin.sites.AlreadyRegistered: pass

@admin.register(TeamsDestination)
class TeamsDestinationAdmin(admin.ModelAdmin):
    exclude = ("webhook_url",)
    list_display = ("user", "name", "is_active", "webhook_secret_reference", "updated_at")
    search_fields = ("user__username", "name", "webhook_secret_reference")
