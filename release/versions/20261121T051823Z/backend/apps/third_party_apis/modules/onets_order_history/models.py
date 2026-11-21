from django.db import models


class OrderHistoryRequest(models.Model):
    """Local copy of a ServiceNow request, keyed by the ServiceNow request id."""

    id = models.CharField(primary_key=True, max_length=64)
    object_id = models.CharField(max_length=255, blank=True, db_index=True)
    number = models.CharField(max_length=100, blank=True)
    closed_at = models.CharField(max_length=100, blank=True)
    ritm_state = models.CharField(max_length=100, blank=True, db_index=True)
    requested_for = models.CharField(max_length=255, blank=True)
    opened_by = models.CharField(max_length=255, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    ritm_assigned_to = models.CharField(max_length=255, blank=True)
    approval_stage = models.CharField(max_length=100, blank=True)
    stage = models.CharField(max_length=100, blank=True)
    ritm_comments = models.JSONField(default=list, blank=True)
    ritm_approvers = models.JSONField(default=list, blank=True)
    variables = models.JSONField(default=list, blank=True)
    form_data = models.JSONField(null=True, blank=True)
    product_id = models.CharField(max_length=64, blank=True)
    product_identifier = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-opened_at", "id")

    def __str__(self):
        return self.number or self.id


class OrderHistoryTask(models.Model):
    number = models.CharField(primary_key=True, max_length=100)
    request = models.ForeignKey(
        OrderHistoryRequest,
        on_delete=models.CASCADE,
        related_name="tasks",
        db_column="request_id",
    )
    ritm = models.CharField(max_length=100, blank=True)
    created = models.DateTimeField(null=True, blank=True)
    state = models.CharField(max_length=100, blank=True)
    due = models.DateTimeField(null=True, blank=True)
    assignment_group = models.CharField(max_length=255, blank=True)
    assignment_group_manager = models.CharField(max_length=255, blank=True)
    assigned_to = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created", "number")

    def __str__(self):
        return self.number
