import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

class RecommendationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PRESENTED = "presented", "Presented"
    ACCEPTED = "accepted", "Accepted"
    DISMISSED = "dismissed", "Dismissed"
    EXPIRED = "expired", "Expired"


class NotificationType(models.TextChoices):
    APPROVAL = "approval", "Approval"
    ASSIGNMENT = "assignment", "Assignment"
    COMMENT = "comment", "Comment"
    GOVERNANCE = "governance", "Governance"
    SYSTEM = "system", "System"
    SECURITY = "security", "Security"

class DeliveryChannel(models.TextChoices):
    IN_APP = "in_app", "In app"
    EMAIL = "email", "Email"
    TEAMS = "teams", "Microsoft Teams"
    DIGEST = "digest", "Digest"
    PUSH = "push", "Mobile push"

class DeliveryStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    MATERIALIZED = "materialized", "Materialized"
    QUEUED = "queued", "Queued"
    PROCESSING = "processing", "Processing"
    DELIVERED = "delivered", "Delivered"
    RETRYING = "retrying", "Retrying"
    FAILED = "failed", "Failed"
    SUPPRESSED = "suppressed", "Suppressed"

class DigestFrequency(models.TextChoices):
    OFF = "off", "Off"
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"

class RuleAction(models.TextChoices):
    ALLOW = "allow", "Allow"
    SUPPRESS = "suppress", "Suppress"
    FORCE_IN_APP = "force_in_app", "Force in-app"
    FORCE_EMAIL = "force_email", "Force email"
    FORCE_TEAMS = "force_teams", "Force Teams"
    DIGEST_ONLY = "digest_only", "Digest only"

class NotificationQuerySet(models.QuerySet):
    def for_user(self, user): return self.filter(recipient=user)
    def unread(self): return self.filter(read=False)
    def active(self): return self.filter(is_deleted=False)

class Notification(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="notifications")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="notifications")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=32, choices=NotificationType.choices, default=NotificationType.SYSTEM, db_index=True)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    url = models.URLField(max_length=500, blank=True)
    read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=100, default="application")
    source_object_type = models.CharField(max_length=100, blank=True)
    source_object_id = models.CharField(max_length=100, blank=True)
    correlation_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    idempotency_key = models.CharField(max_length=255, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="notifications_created")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="notifications_updated")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    digest_sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    objects = NotificationQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["recipient", "read", "-created_at"], name="notif_user_unread_idx"), models.Index(fields=["recipient", "notification_type", "-created_at"], name="notif_user_type_idx"), models.Index(fields=["is_deleted", "created_at"], name="notif_retention_idx"), models.Index(fields=["recipient", "digest_sent_at", "created_at"], name="notif_digest_idx")]
        constraints = [models.UniqueConstraint(fields=["recipient", "idempotency_key"], condition=Q(idempotency_key__isnull=False), name="uniq_recipient_idempotency"), models.CheckConstraint(check=(Q(read=True, read_at__isnull=False) | Q(read=False, read_at__isnull=True)), name="notif_read_timestamp_consistent")]
    def clean(self):
        if self.read != bool(self.read_at): raise ValidationError({"read_at": "read_at must be set exactly when read is true."})
    def __str__(self): return f"{self.recipient}: {self.title}"

class NotificationRecommendation(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="recommendations",)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="notification_recommendations",)
    recommendation_type = models.CharField(max_length=50, db_index=True,)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    action_url = models.URLField(max_length=500, blank=True,)
    action_label = models.CharField(max_length=100, blank=True,)
    provider = models.CharField(max_length=50, default="deterministic",)
    model_name = models.CharField(max_length=100, blank=True,)
    confidence = models.FloatField(default=1.0,)
    score = models.FloatField(default=0.0, db_index=True,)
    reason_codes = models.JSONField(default=list, blank=True,)
    metadata = models.JSONField(default=dict, blank=True,)
    status = models.CharField(max_length=20, choices=RecommendationStatus.choices, default=RecommendationStatus.PENDING, db_index=True,)
    presented_at = models.DateTimeField(null=True, blank=True,)
    acted_at = models.DateTimeField(null=True, blank=True,)
    expires_at = models.DateTimeField(null=True, blank=True,)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True,)
    updated_at = models.DateTimeField(auto_now=True,)

    class Meta:
        ordering = ["-score", "-created_at"]
        indexes = [
            models.Index(fields=["notification", "status"], name="notif_rec_status_idx",),
            models.Index(fields=["user", "status"], name="notif_rec_user_idx",),
        ]

    def __str__(self):
        return self.title

class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference")
    in_app_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=False)
    teams_enabled = models.BooleanField(default=False)
    mobile_push_enabled = models.BooleanField(default=False)
    digest_frequency = models.CharField(max_length=10, choices=DigestFrequency.choices, default=DigestFrequency.OFF)
    digest_hour = models.PositiveSmallIntegerField(default=8)
    approval_enabled = models.BooleanField(default=True)
    assignment_enabled = models.BooleanField(default=True)
    comment_enabled = models.BooleanField(default=True)
    governance_enabled = models.BooleanField(default=True)
    system_enabled = models.BooleanField(default=True)
    security_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def clean(self):
        if not 0 <= self.digest_hour <= 23: raise ValidationError({"digest_hour": "Use an hour from 0 through 23."})
    def allows(self, notification_type, channel):
        if notification_type == NotificationType.SECURITY: return True
        category = getattr(self, f"{notification_type}_enabled", True)
        channel_allowed = {DeliveryChannel.IN_APP: self.in_app_enabled, DeliveryChannel.EMAIL: self.email_enabled, DeliveryChannel.TEAMS: self.teams_enabled, DeliveryChannel.DIGEST: self.digest_frequency != DigestFrequency.OFF, DeliveryChannel.PUSH: self.mobile_push_enabled}.get(channel, False)
        return category and channel_allowed

class TeamsDestination(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="teams_notification_destination")
    name = models.CharField(max_length=100, default="Microsoft Teams")
    webhook_url = models.URLField(max_length=1000, blank=True, help_text="Legacy only. Use webhook_secret_reference.")
    webhook_secret_reference = models.CharField(max_length=255, blank=True, help_text="Secret reference, for example env:TEAMS_WEBHOOK_FINANCE")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return f"{self.user}: {self.name}"

class NotificationRule(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="rules")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="rules")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_rules")
    name = models.CharField(max_length=120)
    priority = models.PositiveIntegerField(default=100, db_index=True)
    is_active = models.BooleanField(default=True)
    notification_type = models.CharField(max_length=32, choices=NotificationType.choices, blank=True)
    source = models.CharField(max_length=100, blank=True)
    title_contains = models.CharField(max_length=255, blank=True)
    action = models.CharField(max_length=20, choices=RuleAction.choices)
    stop_processing = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["priority", "id"]
        constraints = [models.UniqueConstraint(fields=["user", "name"], name="uniq_user_rule_name")]
    def matches(self, *, notification_type, source, title):
        return (not self.notification_type or self.notification_type == notification_type) and (not self.source or self.source == source) and (not self.title_contains or self.title_contains.lower() in title.lower())

class NotificationDelivery(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="deliveries")
    channel = models.CharField(max_length=20, choices=DeliveryChannel.choices)
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING, db_index=True)
    attempt_count = models.PositiveIntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failure_code = models.CharField(max_length=100, blank=True)
    failure_summary = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: constraints = [models.UniqueConstraint(fields=["notification", "channel"], name="uniq_notification_channel")]

class NotificationAuditEvent(models.Model):
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="audit_events")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=50)
    correlation_id = models.UUIDField(db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at", "-id"]

class NotificationMetric(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    value = models.FloatField(default=1)
    labels = models.JSONField(default=dict, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    class Meta: indexes = [models.Index(fields=["name", "-recorded_at"], name="notif_metric_time_idx")]

class NotificationDigest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_digests")
    frequency = models.CharField(max_length=10, choices=DigestFrequency.choices)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    item_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "frequency", "period_start", "period_end"], name="uniq_digest_period")]

class OutboxStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    MATERIALIZED = "materialized", "Materialized"
    QUEUED = "queued", "Queued"
    PROCESSING = "processing", "Processing"
    PROCESSED = "processed", "Processed"
    FAILED = "failed", "Failed"
    DEAD_LETTERED = "dead_lettered", "Dead lettered"

class NotificationOutbox(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="outbox_events")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="outbox_events")
    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="outbox_events")
    event_type = models.CharField(max_length=100, default="notification.dispatch")
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=OutboxStatus.choices, default=OutboxStatus.PENDING, db_index=True)
    attempt_count = models.PositiveIntegerField(default=0)
    available_at = models.DateTimeField(db_index=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    last_error_code = models.CharField(max_length=100, blank=True)
    last_error_summary = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["created_at", "id"]
        indexes = [models.Index(fields=["status", "available_at", "created_at"], name="notif_outbox_work_idx")]

class DeadLetterStatus(models.TextChoices):
    OPEN = "open", "Open"
    REQUEUED = "requeued", "Requeued"
    RESOLVED = "resolved", "Resolved"

class NotificationDeadLetter(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="dead_letters")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="dead_letters")
    outbox_event = models.OneToOneField(NotificationOutbox, on_delete=models.CASCADE, related_name="dead_letter")
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="dead_letters")
    channel = models.CharField(max_length=20, choices=DeliveryChannel.choices, blank=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    failure_reason = models.CharField(max_length=500)
    failure_code = models.CharField(max_length=100, blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=DeadLetterStatus.choices, default=DeadLetterStatus.OPEN, db_index=True)
    first_failed_at = models.DateTimeField()
    last_attempt_at = models.DateTimeField()
    requeued_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["status", "-created_at"], name="notif_dlq_status_idx")]

class TemplateStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    RETIRED = "retired", "Retired"

class NotificationTemplate(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="templates")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="templates")
    key = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    default_locale = models.CharField(max_length=20, default="en-US")
    allowed_variables = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=TemplateStatus.choices, default=TemplateStatus.DRAFT, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="notification_templates_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return self.name

class NotificationTemplateVersion(models.Model):
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, related_name="versions")
    version = models.PositiveIntegerField()
    locale = models.CharField(max_length=20, default="en-US")
    subject_template = models.CharField(max_length=255)
    body_template = models.TextField()
    url_template = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=False, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-version", "locale"]
        constraints = [models.UniqueConstraint(fields=["template", "version", "locale"], name="uniq_template_version_locale")]

class CampaignStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_APPROVAL = "pending_approval", "Pending approval"
    APPROVED = "approved", "Approved"
    SCHEDULED = "scheduled", "Scheduled"
    SENDING = "sending", "Sending"
    SENT = "sent", "Sent"
    CANCELLED = "cancelled", "Cancelled"
    FAILED = "failed", "Failed"

class AudienceType(models.TextChoices):
    ALL = "all", "All active users"
    STAFF = "staff", "Staff users"
    USERS = "users", "Selected users"
    GROUPS = "groups", "Selected groups"

class NotificationCampaign(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="campaigns")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="campaigns")
    dynamic_audience = models.ForeignKey("DynamicAudience", null=True, blank=True, on_delete=models.PROTECT, related_name="campaigns")
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    template_version = models.ForeignKey(NotificationTemplateVersion, on_delete=models.PROTECT, related_name="campaigns")
    notification_type = models.CharField(max_length=32, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    audience_type = models.CharField(max_length=20, choices=AudienceType.choices, default=AudienceType.USERS)
    audience_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="notification_campaigns")
    audience_groups = models.ManyToManyField("auth.Group", blank=True, related_name="notification_campaigns")
    context = models.JSONField(default=dict, blank=True)
    variant = models.CharField(max_length=10, blank=True)
    status = models.CharField(max_length=30, choices=CampaignStatus.choices, default=CampaignStatus.DRAFT, db_index=True)
    scheduled_at = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="notification_campaigns_approved")
    approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="notification_campaigns_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failure_summary = models.CharField(max_length=500, blank=True)
    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["status", "scheduled_at"], name="campaign_schedule_idx")]
    def clean(self):
        if self.expires_at and self.scheduled_at and self.expires_at <= self.scheduled_at:
            raise ValidationError({"expires_at": "Expiration must be after the scheduled time."})
        if self.approved_by_id and self.created_by_id and self.approved_by_id == self.created_by_id:
            raise ValidationError({"approved_by": "Campaign approval requires a second person."})

class CampaignRecipient(models.Model):
    campaign = models.ForeignKey(NotificationCampaign, on_delete=models.CASCADE, related_name="recipients")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    variant = models.CharField(max_length=10, blank=True)
    notification = models.ForeignKey(Notification, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING, db_index=True)
    error_summary = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["campaign", "user"], name="uniq_campaign_recipient")]
        indexes = [models.Index(fields=["campaign", "status"], name="campaign_recipient_idx")]

class SummaryFrequency(models.TextChoices):
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"
    ON_DEMAND = "on_demand", "On demand"

class SummaryStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    MATERIALIZED = "materialized", "Materialized"
    QUEUED = "queued", "Queued"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"

class NotificationSummary(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="summaries")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="summaries")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_summaries")
    frequency = models.CharField(max_length=20, choices=SummaryFrequency.choices)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=SummaryStatus.choices, default=SummaryStatus.PENDING, db_index=True)
    provider = models.CharField(max_length=50, default="deterministic")
    model_name = models.CharField(max_length=100, blank=True)
    prompt_version = models.CharField(max_length=30, default="v1")
    input_count = models.PositiveIntegerField(default=0)
    content = models.TextField(blank=True)
    key_points = models.JSONField(default=list, blank=True)
    action_items = models.JSONField(default=list, blank=True)
    category_counts = models.JSONField(default=dict, blank=True)
    error_code = models.CharField(max_length=100, blank=True)
    error_summary = models.CharField(max_length=500, blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["-period_end", "-id"]
        constraints = [models.UniqueConstraint(fields=["user", "frequency", "period_start", "period_end"], name="uniq_summary_period")]
        indexes = [models.Index(fields=["user", "status", "-period_end"], name="notif_summary_user_idx")]

class NotificationEvent(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="events")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="events")
    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    aggregate_type = models.CharField(max_length=100, default="Notification")
    aggregate_id = models.CharField(max_length=100, db_index=True)
    aggregate_version = models.PositiveIntegerField()
    event_type = models.CharField(max_length=120, db_index=True)
    schema_version = models.PositiveSmallIntegerField(default=1)
    payload = models.JSONField(default=dict, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    correlation_id = models.UUIDField(db_index=True)
    causation_id = models.UUIDField(null=True, blank=True, db_index=True)
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["aggregate_type", "aggregate_id", "aggregate_version"]
        constraints = [models.UniqueConstraint(fields=["aggregate_type", "aggregate_id", "aggregate_version"], name="uniq_event_aggregate_version")]
        indexes = [models.Index(fields=["event_type", "-occurred_at"], name="notif_event_type_idx")]

class NotificationEventCheckpoint(models.Model):
    projection_name = models.CharField(max_length=120, unique=True)
    last_event_id = models.UUIDField(null=True, blank=True)
    last_created_at = models.DateTimeField(null=True, blank=True)
    processed_count = models.PositiveBigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

class PushProvider(models.TextChoices):
    WEB_PUSH = "web_push", "Web Push"
    FCM = "fcm", "Firebase Cloud Messaging"
    APNS = "apns", "Apple Push Notification Service"

class PushPlatform(models.TextChoices):
    WEB = "web", "Web"
    ANDROID = "android", "Android"
    IOS = "ios", "iOS"

class PushDevice(models.Model):
    tenant = models.ForeignKey("NotificationTenant", null=True, blank=True, on_delete=models.CASCADE, related_name="push_devices")
    application = models.ForeignKey("RegisteredApplication", null=True, blank=True, on_delete=models.SET_NULL, related_name="push_devices")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="push_devices")
    provider = models.CharField(max_length=20, choices=PushProvider.choices)
    platform = models.CharField(max_length=20, choices=PushPlatform.choices)
    device_identifier = models.CharField(max_length=255)
    token_encrypted = models.TextField()
    token_digest = models.CharField(max_length=64, db_index=True)
    application_identifier = models.CharField(max_length=160, default="notification-app")
    locale = models.CharField(max_length=20, default="en-US")
    time_zone = models.CharField(max_length=64, default="UTC")
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    token_updated_at = models.DateTimeField(auto_now=True)
    failure_count = models.PositiveIntegerField(default=0)
    disabled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "provider", "device_identifier", "application_identifier"], name="uniq_user_push_device")]
        indexes = [models.Index(fields=["provider", "is_active"], name="push_provider_active_idx")]

class PushDeliveryReceipt(models.Model):
    delivery = models.ForeignKey(NotificationDelivery, on_delete=models.CASCADE, related_name="push_receipts")
    device = models.ForeignKey(PushDevice, on_delete=models.CASCADE, related_name="receipts")
    provider_message_id = models.CharField(max_length=255, blank=True)
    accepted = models.BooleanField(default=False)
    response_code = models.CharField(max_length=50, blank=True)
    response_summary = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["delivery", "device"], name="uniq_delivery_push_device")]

class TenantRole(models.TextChoices):
    MEMBER = "member", "Member"
    ADMIN = "admin", "Tenant administrator"
    OWNER = "owner", "Tenant owner"

class NotificationTenant(models.Model):
    key = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=180)
    is_active = models.BooleanField(default=True, db_index=True)
    retention_days = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return self.name

class RegisteredApplication(models.Model):
    tenant = models.ForeignKey(NotificationTenant, on_delete=models.CASCADE, related_name="applications")
    key = models.SlugField(max_length=100)
    name = models.CharField(max_length=180)
    owner_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["tenant", "key"], name="uniq_tenant_application")]
    def __str__(self): return f"{self.tenant.key}/{self.key}"

class ApplicationEnvironment(models.Model):
    application = models.ForeignKey(RegisteredApplication, on_delete=models.CASCADE, related_name="environments")
    name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["application", "name"], name="uniq_application_environment")]

class TenantMembership(models.Model):
    tenant = models.ForeignKey(NotificationTenant, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_tenant_memberships")
    role = models.CharField(max_length=20, choices=TenantRole.choices, default=TenantRole.MEMBER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["tenant", "user"], name="uniq_tenant_membership")]

class AudienceOperator(models.TextChoices):
    EQUALS = "equals", "Equals"
    IN = "in", "In"
    CONTAINS = "contains", "Contains"
    IS_TRUE = "is_true", "Is true"
    IS_FALSE = "is_false", "Is false"

class DynamicAudience(models.Model):
    tenant = models.ForeignKey(NotificationTenant, null=True, blank=True, on_delete=models.CASCADE, related_name="dynamic_audiences")
    application = models.ForeignKey(RegisteredApplication, null=True, blank=True, on_delete=models.CASCADE, related_name="dynamic_audiences")
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    include_user_ids = models.JSONField(default=list, blank=True)
    exclude_user_ids = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["tenant", "name"], name="uniq_tenant_audience_name")]

class AudienceCondition(models.Model):
    audience = models.ForeignKey(DynamicAudience, on_delete=models.CASCADE, related_name="conditions")
    field = models.CharField(max_length=80)
    operator = models.CharField(max_length=20, choices=AudienceOperator.choices)
    value = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AudienceSnapshot(models.Model):
    audience = models.ForeignKey(DynamicAudience, on_delete=models.PROTECT, related_name="snapshots")
    campaign = models.OneToOneField(NotificationCampaign, null=True, blank=True, on_delete=models.CASCADE, related_name="audience_snapshot")
    definition = models.JSONField(default=dict)
    member_count = models.PositiveIntegerField(default=0)
    definition_hash = models.CharField(max_length=64, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

class AudienceSnapshotMember(models.Model):
    snapshot = models.ForeignKey(AudienceSnapshot, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["snapshot", "user"], name="uniq_audience_snapshot_member")]

class PriorityLevel(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"

class PriorityPolicy(models.Model):
    name = models.CharField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)
    notification_type = models.CharField(max_length=32, choices=NotificationType.choices, blank=True)
    source = models.CharField(max_length=100, blank=True)
    required_priority = models.CharField(max_length=20, choices=PriorityLevel.choices, blank=True)
    base_score = models.PositiveSmallIntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class NotificationPriorityAssessment(models.Model):
    notification = models.OneToOneField(Notification, on_delete=models.CASCADE, related_name="priority_assessment")
    recommended_priority = models.CharField(max_length=20, choices=PriorityLevel.choices)
    final_priority = models.CharField(max_length=20, choices=PriorityLevel.choices)
    confidence = models.FloatField(default=1.0)
    score = models.PositiveSmallIntegerField(default=50)
    reason_codes = models.JSONField(default=list)
    provider = models.CharField(max_length=50, default="deterministic")
    model_name = models.CharField(max_length=100, blank=True)
    policy_version = models.CharField(max_length=30, default="v1")
    input_schema_version = models.CharField(max_length=30, default="v1")
    assessed_at = models.DateTimeField(auto_now_add=True)
    overridden_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    override_reason = models.CharField(max_length=500, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class FatigueDecision(models.TextChoices):
    DELIVER = "deliver", "Deliver normally"
    DIGEST = "digest", "Route to digest"
    SUPPRESS_DUPLICATE = "suppress_duplicate", "Suppress duplicate"
    REDUCE_CHANNELS = "reduce_channels", "Reduce duplicate channels"
    DELAY = "delay", "Delay optional delivery"
    BYPASS = "bypass", "Mandatory bypass"

class NotificationFatigueAssessment(models.Model):
    notification = models.OneToOneField(Notification, on_delete=models.CASCADE, related_name="fatigue_assessment")
    decision = models.CharField(max_length=30, choices=FatigueDecision.choices)
    reason_codes = models.JSONField(default=list)
    recent_hour_count = models.PositiveIntegerField(default=0)
    recent_day_count = models.PositiveIntegerField(default=0)
    unread_count = models.PositiveIntegerField(default=0)
    duplicate_count = models.PositiveIntegerField(default=0)
    fingerprint = models.CharField(max_length=64, db_index=True)
    assessed_at = models.DateTimeField(auto_now_add=True)

class NotificationBundle(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_bundles")
    fingerprint = models.CharField(max_length=64, db_index=True)
    title = models.CharField(max_length=255)
    item_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default="open", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notifications = models.ManyToManyField(Notification, related_name="bundles", blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "fingerprint", "status"], name="uniq_open_user_bundle")]

class LedgerVerificationStatus(models.TextChoices):
    PASSED = "passed", "Passed"
    FAILED = "failed", "Failed"

class AuditLedgerEntry(models.Model):
    sequence = models.PositiveBigIntegerField(unique=True)
    previous_hash = models.CharField(max_length=64)
    entry_hash = models.CharField(max_length=64, unique=True)
    event_type = models.CharField(max_length=120, db_index=True)
    aggregate_type = models.CharField(max_length=100)
    aggregate_id = models.CharField(max_length=100, db_index=True)
    actor_reference = models.CharField(max_length=255, blank=True)
    tenant_reference = models.CharField(max_length=100, blank=True)
    application_reference = models.CharField(max_length=100, blank=True)
    correlation_id = models.UUIDField(db_index=True)
    payload_digest = models.CharField(max_length=64)
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sequence"]
        indexes = [models.Index(fields=["aggregate_type", "aggregate_id", "sequence"], name="ledger_aggregate_idx")]

class AuditLedgerCheckpoint(models.Model):
    sequence = models.PositiveBigIntegerField(unique=True)
    entry_hash = models.CharField(max_length=64)
    signature = models.CharField(max_length=128)
    algorithm = models.CharField(max_length=30, default="HMAC-SHA256")
    exported_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLedgerVerification(models.Model):
    status = models.CharField(max_length=20, choices=LedgerVerificationStatus.choices)
    checked_entries = models.PositiveBigIntegerField(default=0)
    first_invalid_sequence = models.PositiveBigIntegerField(null=True, blank=True)
    expected_hash = models.CharField(max_length=64, blank=True)
    actual_hash = models.CharField(max_length=64, blank=True)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField()
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ChaosExperimentRecord(models.Model):
    experiment = models.CharField(max_length=120)
    environment = models.CharField(max_length=50)
    duration_seconds = models.PositiveIntegerField()
    affected_replicas = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=30, default="planned")
    reason = models.CharField(max_length=500, blank=True)
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SavedNotificationView(models.Model):
    tenant=models.ForeignKey("NotificationTenant",null=True,blank=True,on_delete=models.CASCADE,related_name="saved_notification_views")
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="saved_notification_views")
    name=models.CharField(max_length=120)
    filters=models.JSONField(default=dict)
    is_default=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        constraints=[
            models.UniqueConstraint(fields=["tenant","user","name"],name="uniq_saved_notification_view")
        ]

class RecommendationFeedback(models.Model):
    recommendation=models.ForeignKey("NotificationRecommendation",on_delete=models.CASCADE,related_name="feedback")
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="notification_recommendation_feedback")
    helpful=models.BooleanField(null=True,blank=True)
    outcome=models.CharField(max_length=32,choices=[("accepted","Accepted"),("dismissed","Dismissed"),("ignored","Ignored"),("reverted","Reverted")],blank=True)
    comment=models.CharField(max_length=500,blank=True)
    created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)

    class Meta:
        constraints=[
            models.UniqueConstraint(fields=["recommendation","user"],name="uniq_recommendation_feedback")
        ]

class CommunicationInsight(models.Model):
    tenant=models.ForeignKey("NotificationTenant",null=True,blank=True,on_delete=models.CASCADE,related_name="communication_insights")
    application=models.ForeignKey("RegisteredApplication",null=True,blank=True,on_delete=models.CASCADE,related_name="communication_insights")
    insight_type=models.CharField(max_length=80,db_index=True)
    title=models.CharField(max_length=255);summary=models.TextField();evidence=models.JSONField(default=list)
    severity=models.CharField(max_length=20,default="info");period_start=models.DateTimeField(null=True,blank=True);period_end=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)