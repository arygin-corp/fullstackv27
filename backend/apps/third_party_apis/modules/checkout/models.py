import uuid
from django.conf import settings
from django.db import models
from .choices import CartKind, CartStatus, CheckoutItemStatus, CheckoutStatus

PRODUCT_MODEL = getattr(settings, "MARKETPLACE_PRODUCT_MODEL", "marketplace.Product")

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="marketplace_carts")
    kind = models.CharField(max_length=16, choices=CartKind.choices, default=CartKind.PRODUCT)
    status = models.CharField(max_length=24, choices=CartStatus.choices, default=CartStatus.OPEN)
    requested_for_snapshot = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(PRODUCT_MODEL, on_delete=models.PROTECT, related_name="checkout_cart_items")
    line_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    quantity = models.PositiveIntegerField(default=1)
    revision = models.PositiveIntegerField(default=1)
    request_form_values = models.JSONField(default=dict, blank=True)
    request_details_complete = models.BooleanField(default=False)
    business_justification_complete = models.BooleanField(default=False)
    data_usage_complete = models.BooleanField(default=False)
    is_complete = models.BooleanField(default=False)
    missing_sections = models.JSONField(default=list, blank=True)
    validation_errors = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("cart", "line_key"), name="uq_checkout_cart_line_key")]

class Checkout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_cart = models.ForeignKey(Cart, on_delete=models.PROTECT, related_name="checkouts")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_marketplace_checkouts")
    creator_object_id = models.CharField(max_length=128)
    requested_for_object_id = models.CharField(max_length=128)
    submitted_by_email = models.EmailField()
    status = models.CharField(max_length=32, choices=CheckoutStatus.choices, default=CheckoutStatus.VALIDATING)
    idempotency_key = models.UUIDField()
    request_number = models.CharField(max_length=64, blank=True)
    primary_ritm_id = models.CharField(max_length=128, blank=True)
    primary_ritm_number = models.CharField(max_length=64, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("creator", "idempotency_key"), name="uq_checkout_creator_idempotency")]

class CheckoutItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checkout = models.ForeignKey(Checkout, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(PRODUCT_MODEL, on_delete=models.PROTECT, related_name="submitted_checkout_items")
    source_cart_item = models.ForeignKey(CartItem, on_delete=models.PROTECT, related_name="checkout_items")
    line_key = models.UUIDField()
    quantity = models.PositiveIntegerField(default=1)
    form_values_snapshot = models.JSONField(default=dict)
    product_snapshot = models.JSONField(default=dict)
    identity_snapshot = models.JSONField(default=dict)
    final_one_ts_variables = models.JSONField(default=dict)
    one_ts_cart_item_identifier = models.CharField(max_length=128, blank=True)
    status = models.CharField(max_length=24, choices=CheckoutItemStatus.choices, default=CheckoutItemStatus.PENDING)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CheckoutExternalItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checkout = models.ForeignKey(Checkout, on_delete=models.CASCADE, related_name="external_items")
    checkout_item = models.ForeignKey(CheckoutItem, on_delete=models.SET_NULL, related_name="external_items", null=True, blank=True)
    request_number = models.CharField(max_length=64, blank=True)
    ritm_id = models.CharField(max_length=128, blank=True)
    ritm_number = models.CharField(max_length=64, blank=True)
    raw_reference = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
