from types import SimpleNamespace
from django.test import SimpleTestCase
from ..services.cart_validation import validate_cart_item
class ValidationTests(SimpleTestCase):
 def test_invalid_form_remains_incomplete(self):
  result=validate_cart_item(SimpleNamespace(requires_request_description=True,pi=False,sensitive_pi=False,supported_environments=[]),{})
  self.assertFalse(result.is_complete); self.assertIn("Business Justification",result.missing_sections)
 def test_unexpected_fields_rejected(self):
  result=validate_cart_item(SimpleNamespace(requires_request_description=False,pi=False,sensitive_pi=False,supported_environments=[]),{"product_name":"override","v_dar_businessJustification":"x"*30})
  self.assertIn("form_values",result.field_errors)
