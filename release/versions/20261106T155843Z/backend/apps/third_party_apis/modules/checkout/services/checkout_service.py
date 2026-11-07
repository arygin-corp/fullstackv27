from django.db import transaction
from django.utils import timezone
from ..choices import CartKind, CartStatus, CheckoutItemStatus, CheckoutStatus
from ..models import Cart, Checkout, CheckoutExternalItem, CheckoutItem
from .cart_validation import validate_cart_item
from .form_builder import load_definition
from .exceptions import EmptyCartError, IncompleteCartError, MixedCartError, ProductValidationError, TermsRequiredError
from .identity import resolve_creator, resolve_requested_for
from .one_ts_client import OneTSClient
from .one_ts_mapper import build_variables, snapshot_product

def prepare_checkout(*, request, cart_id, idempotency_key, terms_accepted, requested_for=None):
    if terms_accepted is not True: raise TermsRequiredError("Terms of Use must be accepted.")
    existing = Checkout.objects.filter(creator=request.user, idempotency_key=idempotency_key).first()
    if existing: return existing, False
    with transaction.atomic():
        cart = Cart.objects.select_for_update().prefetch_related("items__product").get(id=cart_id, owner=request.user)
        items = list(cart.items.all())
        if not items: raise EmptyCartError("The cart is empty.")
        if cart.kind == CartKind.DAR:
            if len(items) != 1: raise MixedCartError("DAR checkout allows exactly one DAR.")
            raise MixedCartError("DAR checkout uses the separate DAR submission flow.")
        if any(not item.is_complete for item in items):
            raise IncompleteCartError("One or more products require form information.", items=[{"line_key":str(i.line_key),"product_id":i.product_id,"status":"failed","field_errors":i.validation_errors} for i in items if not i.is_complete])
        creator = resolve_creator(request); requested = resolve_requested_for(request, cart, requested_for)
        checkout = Checkout.objects.create(source_cart=cart, creator=request.user, creator_object_id=creator["object_id"], requested_for_object_id=requested["object_id"], submitted_by_email=creator["email"], status=CheckoutStatus.VALIDATING, idempotency_key=idempotency_key)
        for item in items:
            validation = validate_cart_item(item.product, item.request_form_values, definition=load_definition())
            if not validation.is_complete: raise ProductValidationError("One or more products are invalid.")
            product_snapshot = snapshot_product(item.product)
            variables = build_variables(item.product, validation.normalized_form_values, creator, requested, True)
            CheckoutItem.objects.create(checkout=checkout, product=item.product, source_cart_item=item, line_key=item.line_key, quantity=item.quantity, form_values_snapshot=validation.normalized_form_values, product_snapshot=product_snapshot, identity_snapshot={"creator":creator,"requested_for":requested}, final_one_ts_variables=variables, status=CheckoutItemStatus.VALIDATED)
        checkout.status = CheckoutStatus.READY; checkout.save(update_fields=["status","updated_at"])
        cart.status = CartStatus.CHECKING_OUT; cart.save(update_fields=["status","updated_at"])
    return checkout, True

def execute_checkout(checkout, client_factory=OneTSClient):
    if checkout.status == CheckoutStatus.SUBMITTED: return checkout
    checkout.status = CheckoutStatus.ADDING_ITEMS; checkout.save(update_fields=["status","updated_at"])
    with client_factory() as client:
        for item in checkout.items.order_by("created_at"):
            item.status = CheckoutItemStatus.ADDING; item.save(update_fields=["status","updated_at"])
            try: result = client.add_to_cart(item.final_one_ts_variables, item.quantity)
            except Exception as exc:
                item.status = CheckoutItemStatus.FAILED; item.error_message = str(exc); item.save(update_fields=["status","error_message","updated_at"])
                checkout.status = CheckoutStatus.PARTIALLY_FAILED; checkout.error_message = str(exc); checkout.save(update_fields=["status","error_message","updated_at"])
                return checkout
            item.status = CheckoutItemStatus.ADDED; item.one_ts_cart_item_identifier = result["cart_item_identifier"]; item.save(update_fields=["status","one_ts_cart_item_identifier","updated_at"])
        checkout.status = CheckoutStatus.SUBMITTING; checkout.save(update_fields=["status","updated_at"])
        result = client.submit_cart()
    checkout.request_number=result["request_number"]; checkout.primary_ritm_id=result["ritm_id"]; checkout.primary_ritm_number=result["ritm_number"]; checkout.status=CheckoutStatus.SUBMITTED; checkout.submitted_at=timezone.now(); checkout.save(update_fields=["request_number","primary_ritm_id","primary_ritm_number","status","submitted_at","updated_at"])
    ritms = result["ritms"] or [{"ritm_id":result["ritm_id"],"ritm_number":result["ritm_number"]}]
    for record in ritms: CheckoutExternalItem.objects.create(checkout=checkout, request_number=result["request_number"], ritm_id=str(record.get("ritm_id") or ""), ritm_number=str(record.get("ritm_number") or ""), raw_reference={k:v for k,v in record.items() if k in {"ritm_id","ritm_number","request_number"}})
    checkout.items.filter(status=CheckoutItemStatus.ADDED).update(status=CheckoutItemStatus.SUBMITTED)
    checkout.source_cart.status=CartStatus.SUBMITTED; checkout.source_cart.save(update_fields=["status","updated_at"])
    return checkout
