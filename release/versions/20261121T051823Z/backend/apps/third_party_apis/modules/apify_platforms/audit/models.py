import uuid
from django.conf import settings
from django.db import models


class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey("tenancy.Tenant", null=True, on_delete=models.PROTECT)
    team = models.ForeignKey("tenancy.EnterpriseTeam", null=True, blank=True, on_delete=models.PROTECT,)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="audit_events")
    actor_identifier = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=120, db_index=True)
    category = models.CharField(max_length=60, default="application")
    action = models.CharField(max_length=80, blank=True)
    outcome = models.CharField(max_length=32, default="success")
    severity = models.CharField(max_length=20, default="info")
    object_type = models.CharField(max_length=120, blank=True)
    object_id = models.CharField(max_length=120, blank=True)
    correlation_id = models.CharField(max_length=120, blank=True, db_index=True)
    request_id = models.CharField(max_length=120, blank=True, db_index=True)
    idempotency_key = models.CharField(max_length=160, blank=True)
    source_ip = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    http_method = models.CharField(max_length=12, blank=True)
    request_path = models.CharField(max_length=1000, blank=True)
    status_code = models.PositiveIntegerField(null=True)
    before_state = models.JSONField(default=dict)
    after_state = models.JSONField(default=dict)
    metadata = models.JSONField(default=dict)
    error_code = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True, db_index=True)
    previous_hash = models.CharField(max_length=64, blank=True)
    event_hash = models.CharField(max_length=64, unique=True, null=True)

    class Meta:
        ordering = ["-occurred_at"]
