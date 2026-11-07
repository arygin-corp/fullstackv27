from django.db import models

class CartStatus(models.TextChoices):
    OPEN = "open", "Open"
    CHECKING_OUT = "checking_out", "Checking out"
    SUBMITTED = "submitted", "Submitted"
    ABANDONED = "abandoned", "Abandoned"

class CartKind(models.TextChoices):
    PRODUCT = "product", "Product"
    DAR = "dar", "Data Access Request"

class CheckoutStatus(models.TextChoices):
    VALIDATING = "validating", "Validating"
    READY = "ready", "Ready"
    ADDING_ITEMS = "adding_items", "Adding items"
    PARTIALLY_FAILED = "partially_failed", "Partially failed"
    SUBMITTING = "submitting", "Submitting"
    SUBMITTED = "submitted", "Submitted"
    FAILED = "failed", "Failed"

class CheckoutItemStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    VALIDATED = "validated", "Validated"
    ADDING = "adding", "Adding"
    ADDED = "added", "Added"
    FAILED = "failed", "Failed"
    SUBMITTED = "submitted", "Submitted"
