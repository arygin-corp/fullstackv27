import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django_ckeditor_5.fields import CKEditor5Field

PII_TYPE = (("Yes", "Yes"), ("No", "No"))


class ImmutableQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValidationError("Immutable records cannot be updated.")

    def delete(self):
        raise ValidationError("Immutable records cannot be deleted.")


class ImmutableManager(models.Manager.from_queryset(ImmutableQuerySet)):
    pass


class IntakeProductTags(models.Model):
    """Legacy-compatible intake tag model."""
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField("Active", default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="forms_intake_product_tags_author_create",
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="forms_intake_product_tags_author_update",
    )
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "Tag"
        verbose_name_plural = "Tags"

    def __str__(self):
        return f"{self.name} | {self.is_active}"


class ProductIntake(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        ASSIGNED = "assigned", "Assigned"
        UNDER_REVIEW = "under_review", "Under Review"
        NEEDS_INFORMATION = "needs_information", "Needs Information"
        APPROVED = "approved", "Approved"
        PRODUCT_DRAFT = "product_draft", "Product Draft"
        CURATED = "curated", "Curated"
        REJECTED = "rejected", "Rejected"
        RESUBMITTED = "resubmitted", "Resubmitted"
        IMPLEMENTED = "implemented", "Implemented"
        ARCHIVED = "archived", "Archived"

    # Legacy fields retained to avoid destructive migration and keep old templates working.
    product_name = models.CharField("Product Name", max_length=120, blank=True, null=True)
    product_desc = CKEditor5Field("Product Description", config_name="extends", max_length=4000, blank=True, null=True)
    product_type = models.CharField("Product Type", max_length=32, blank=True, null=True)
    product_url = models.CharField("Product URL", max_length=2500, blank=True, null=True)
    product_tags = models.ManyToManyField(IntakeProductTags, blank=True)
    product_domain = models.CharField("Product Domain", max_length=50, blank=True, null=True)
    stakeholder_name = models.CharField("Stakeholder Name", max_length=4000, blank=True, null=True)
    product_pii = models.CharField("Sensitive PI", max_length=5, choices=PII_TYPE, blank=True, null=True)
    product_spi = models.CharField("Sensitive SPI", max_length=5, choices=PII_TYPE, blank=True, null=True)
    pii_explanation = CKEditor5Field("Sensitive PI/SPI Explanation", config_name="extends", max_length=4000, blank=True, null=True)

    sample_field1 = models.CharField(max_length=50, blank=True, null=True)
    sample_value1 = models.CharField(max_length=50, blank=True, null=True)
    sample_field2 = models.CharField(max_length=50, blank=True, null=True)
    sample_value2 = models.CharField(max_length=50, blank=True, null=True)
    sample_field3 = models.CharField(max_length=50, blank=True, null=True)
    sample_value3 = models.CharField(max_length=50, blank=True, null=True)
    sample_field4 = models.CharField(max_length=50, blank=True, null=True)
    sample_value4 = models.CharField(max_length=50, blank=True, null=True)
    sample_field5 = models.CharField(max_length=50, blank=True, null=True)
    sample_value5 = models.CharField(max_length=50, blank=True, null=True)
    sample_field6 = models.CharField(max_length=50, blank=True, null=True)
    sample_value6 = models.CharField(max_length=50, blank=True, null=True)
    sample_field7 = models.CharField(max_length=50, blank=True, null=True)
    sample_value7 = models.CharField(max_length=50, blank=True, null=True)
    sample_field8 = models.CharField(max_length=50, blank=True, null=True)
    sample_value8 = models.CharField(max_length=50, blank=True, null=True)
    sample_field9 = models.CharField(max_length=50, blank=True, null=True)
    sample_value9 = models.CharField(max_length=50, blank=True, null=True)
    sample_field10 = models.CharField(max_length=50, blank=True, null=True)
    sample_value10 = models.CharField(max_length=50, blank=True, null=True)
    sample_fields = models.TextField("Sample Fields", blank=True)
    sample_values = models.TextField("Sample Values", blank=True)

    # Kept on Intake only; deliberately never copied to marketplace.Product.
    fulfillment_group = models.CharField("Fulfillment Group Name", max_length=255, blank=True, null=True)

    # Legacy identity fields retained for compatibility.
    requester_name = models.CharField("Requester Name", max_length=50, blank=True, null=True)
    requester_email = models.EmailField("Requester Email", max_length=254, blank=True)
    requester_id = models.CharField("Requester ID", max_length=50, blank=True, null=True)

    # Angular-provided business identities.
    requester_first_name = models.CharField(max_length=150, blank=True)
    requester_last_name = models.CharField(max_length=150, blank=True)
    submitted_by_first_name = models.CharField(max_length=150, blank=True)
    submitted_by_last_name = models.CharField(max_length=150, blank=True)
    submitted_by_email = models.EmailField(max_length=254, blank=True)

    # Exact Marketplace relationships needed for reliable Product creation.
    marketplace_domain = models.ForeignKey(
        "marketplace.Domain", on_delete=models.PROTECT, null=True, blank=True,
        related_name="product_intakes",
    )
    marketplace_datatype = models.ForeignKey(
        "marketplace.Datatype", on_delete=models.PROTECT, null=True, blank=True,
        related_name="product_intakes",
    )
    marketplace_classification = models.ForeignKey(
        "marketplace.Classification", on_delete=models.PROTECT, null=True, blank=True,
        related_name="product_intakes",
    )
    marketplace_product = models.OneToOneField(
        "marketplace.Product", on_delete=models.PROTECT, null=True, blank=True,
        related_name="source_intake",
    )

    status = models.CharField(max_length=30, choices=Status.choices, default=Status.DRAFT, db_index=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assigned_product_intakes",
    )
    rejection_reason = models.CharField(max_length=250, blank=True)
    rejection_comments = models.TextField(max_length=4000, blank=True)
    approval_reason = models.TextField(max_length=4000, blank=True)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="decided_product_intakes",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    review_started_at = models.DateTimeField(null=True, blank=True)
    decision_at = models.DateTimeField(null=True, blank=True)
    implemented_at = models.DateTimeField(null=True, blank=True)
    sla_due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    idempotency_key = models.UUIDField(null=True, blank=True)

    is_active = models.BooleanField("Active", default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="forms_product_intake_author_create",
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="forms_product_intake_author_update",
    )
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "Product Intake"
        verbose_name_plural = "Product Intake"
        permissions = [
            ("manage_productintake", "Can manage product intake workflow"),
            ("approve_productintake", "Can approve product intake"),
            ("reject_productintake", "Can reject product intake"),
            ("activate_marketplace_product", "Can activate linked Marketplace product"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["submitted_by_email", "idempotency_key"],
                condition=models.Q(idempotency_key__isnull=False),
                name="intake_unique_submitter_idempotency",
            ),
        ]

    @property
    def requester_full_name(self):
        return " ".join(filter(None, [self.requester_first_name, self.requester_last_name])).strip()

    @property
    def submitted_by_full_name(self):
        return " ".join(filter(None, [self.submitted_by_first_name, self.submitted_by_last_name])).strip()

    def __str__(self):
        return f"{self.product_name or 'Unnamed'} | {self.product_domain or ''} | {self.get_status_display()}"


class IntakeApprovalEvent(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Created"
        SUBMITTED = "submitted", "Submitted"
        ASSIGNED = "assigned", "Assigned"
        REVIEW_STARTED = "review_started", "Review Started"
        INFORMATION_REQUESTED = "information_requested", "Information Requested"
        APPROVED = "approved", "Approved"
        PRODUCT_DRAFTED = "product_drafted", "Product Drafted"
        CURATED = "curated", "Curated"
        REJECTED = "rejected", "Rejected"
        RESUBMITTED = "resubmitted", "Resubmitted"
        IMPLEMENTED = "implemented", "Implemented"
        ARCHIVED = "archived", "Archived"

    intake = models.ForeignKey(ProductIntake, on_delete=models.PROTECT, related_name="approval_events")
    action = models.CharField(max_length=40, choices=Action.choices)
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    reason = models.CharField(max_length=250, blank=True)
    comments = models.TextField(max_length=4000, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    actor_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        default_permissions = ()


class ProductIntakeAuditLog(models.Model):
    intake = models.ForeignKey(ProductIntake, on_delete=models.PROTECT, related_name="audit_logs")
    action = models.CharField(max_length=50)
    changed_fields = models.JSONField(default=list)
    changes = models.JSONField(default=dict)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    actor_email = models.EmailField(blank=True)
    request_id = models.CharField(max_length=100, blank=True, db_index=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    objects = ImmutableManager()

    class Meta:
        ordering = ["-created_at", "-id"]
        default_permissions = ()

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValidationError("Audit records are immutable.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Audit records cannot be deleted.")


class IntakeSecurityEvent(models.Model):
    event_type = models.CharField(max_length=50, db_index=True)
    outcome = models.CharField(max_length=20)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    actor_email = models.EmailField(blank=True)
    target_email = models.EmailField(blank=True)
    intake = models.ForeignKey(ProductIntake, on_delete=models.SET_NULL, null=True, blank=True)
    request_id = models.CharField(max_length=100, blank=True, db_index=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    objects = ImmutableManager()

    class Meta:
        ordering = ["-created_at", "-id"]
        default_permissions = ()

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValidationError("Security events are immutable.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Security events cannot be deleted.")


class UserNotification(models.Model):
    class Severity(models.TextChoices):
        INFO = "info", "Info"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"

    recipient_email = models.EmailField(db_index=True)
    recipient_first_name = models.CharField(max_length=150, blank=True)
    recipient_last_name = models.CharField(max_length=150, blank=True)
    intake = models.ForeignKey(ProductIntake, on_delete=models.CASCADE, related_name="notifications")
    event = models.CharField(max_length=50)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)
    title = models.CharField(max_length=250)
    message = models.TextField()
    action_url = models.CharField(max_length=1000, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]


class NotificationOutbox(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        DELIVERED = "delivered", "Delivered"
        FAILED = "failed", "Failed"

    event_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    event_type = models.CharField(max_length=50)
    intake = models.ForeignKey(ProductIntake, on_delete=models.CASCADE, related_name="outbox_items")
    recipient = models.EmailField()
    template_name = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    attempt_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    next_attempt_at = models.DateTimeField(auto_now_add=True, db_index=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
