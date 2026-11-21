from django.db import models


class MarketplaceOrder(models.Model):
    class SyncStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        SYNCHRONIZED = "SYNCHRONIZED", "Synchronized"
        PARTIAL = "PARTIAL", "Partial"
        FAILED = "FAILED", "Failed"

    id = models.BigAutoField(primary_key=True)
    marketplace_order_id = models.CharField(max_length=255, unique=True)
    sync_status = models.CharField(max_length=30, choices=SyncStatus.choices, default=SyncStatus.PENDING)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self):
        return self.marketplace_order_id


class Request(models.Model):
    id = models.BigAutoField(primary_key=True)
    marketplace_order = models.ForeignKey(MarketplaceOrder, on_delete=models.PROTECT, related_name="requests", null=True, blank=True,)
    number = models.CharField(max_length=100, db_index=True)  # requestNum / REQ
    ritm_id = models.CharField(max_length=255, db_index=True)  # ritmID / ServiceNow internal ID
    ritm_number = models.CharField(max_length=100, db_index=True)  # ritm / RITM
    object_id = models.CharField(max_length=255, db_index=True)  # MSAL person object ID
    product_id = models.CharField(max_length=255, blank=True, db_index=True)
    approval_stage = models.CharField(max_length=100, blank=True)
    ritm_state = models.CharField(max_length=100, blank=True)
    stage = models.CharField(max_length=100, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    requested_for = models.CharField(max_length=255, blank=True)
    opened_by = models.CharField(max_length=255, blank=True)
    ritm_assigned_to = models.CharField(max_length=255, blank=True)
    ritm_comments = models.JSONField(default=list, blank=True)
    ritm_approvers = models.JSONField(default=list, blank=True)
    variables = models.JSONField(default=dict, blank=True)
    form_data = models.JSONField(null=True, blank=True)
    source_updated_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-opened_at", "-id")
        constraints = [
            models.UniqueConstraint(fields=("marketplace_order", "ritm_id"), name="uq_marketplace_order_ritm_id"),
        ]
        indexes = [
            models.Index(fields=("object_id", "opened_at"), name="ord_person_opened_idx"),
            models.Index(fields=("number", "object_id"), name="ord_req_person_idx"),
            models.Index(fields=("ritm_number", "object_id"), name="ord_ritm_person_idx"),
        ]

    def __str__(self):
        return f"{self.number} / {self.ritm_number}"


class Task(models.Model):
    id = models.BigAutoField(primary_key=True)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="tasks")
    task_id = models.CharField(max_length=255, blank=True, db_index=True)
    number = models.CharField(max_length=100, db_index=True)
    ritm = models.CharField(max_length=100, blank=True, db_index=True)
    created = models.DateTimeField(null=True, blank=True)
    state = models.CharField(max_length=100, blank=True)
    due = models.DateTimeField(null=True, blank=True)
    assignment_group = models.CharField(max_length=255, blank=True)
    assignment_group_manager = models.CharField(max_length=255, blank=True)
    assigned_to = models.CharField(max_length=255, blank=True)
    source_updated_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created", "id")
        constraints = [
            models.UniqueConstraint(fields=("request", "number"), name="uq_request_task_number"),
        ]

    def __str__(self):
        return self.number


class UserActivity(models.Model):
    """A frontend action captured for the signed-in marketplace account."""

    object_id = models.CharField(max_length=255, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    action = models.CharField(max_length=40, db_index=True)
    title = models.CharField(max_length=255)
    detail = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = [
            models.Index(fields=("object_id", "-created_at"), name="ord_activity_person_idx"),
        ]

    def __str__(self):
        return f"{self.action} {self.detail}"


class SyncCursor(models.Model):
    name = models.CharField(max_length=100, unique=True)
    watermark = models.DateTimeField(null=True, blank=True)
    cursor = models.TextField(blank=True)
    last_started_at = models.DateTimeField(null=True, blank=True)
    last_completed_at = models.DateTimeField(null=True, blank=True)
    last_status = models.CharField(max_length=30, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class ServiceNowSyncAudit(models.Model):
    id = models.BigAutoField(primary_key=True)
    marketplace_order = models.ForeignKey(MarketplaceOrder, on_delete=models.PROTECT, related_name="sync_audits", null=True, blank=True)
    correlation_id = models.CharField(max_length=100, db_index=True)
    sync_run_id = models.CharField(max_length=100, blank=True, db_index=True)
    entity_type = models.CharField(max_length=30)
    operation = models.CharField(max_length=50)
    status = models.CharField(max_length=30)
    servicenow_ritm_id = models.CharField(max_length=255, blank=True, db_index=True)
    request_number = models.CharField(max_length=100, blank=True)
    ritm_number = models.CharField(max_length=100, blank=True)
    task_number = models.CharField(max_length=100, blank=True)
    changed_fields = models.JSONField(default=list, blank=True)
    metrics = models.JSONField(default=dict, blank=True)
    error_category = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_ms = models.PositiveBigIntegerField(null=True, blank=True)

    class Meta:
        ordering = ("-started_at", "-id")
