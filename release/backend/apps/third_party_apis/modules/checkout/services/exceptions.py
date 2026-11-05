class CheckoutDomainError(Exception):
    code = "CHECKOUT_ERROR"
    def __init__(self, message, *, items=None):
        super().__init__(message); self.message = message; self.items = items or []

class CartItemStaleError(CheckoutDomainError): code = "CART_ITEM_STALE"
class EmptyCartError(CheckoutDomainError): code = "EMPTY_CART"
class IncompleteCartError(CheckoutDomainError): code = "INCOMPLETE_CART"
class MixedCartError(CheckoutDomainError): code = "MIXED_CART_NOT_ALLOWED"
class TermsRequiredError(CheckoutDomainError): code = "TERMS_REQUIRED"
class ProductValidationError(CheckoutDomainError): code = "PRODUCT_VALIDATION_FAILED"
class OneTSAddError(CheckoutDomainError): code = "ONETS_ADD_FAILED"
class OneTSSubmitError(CheckoutDomainError): code = "ONETS_SUBMIT_FAILED"
