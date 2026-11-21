from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from .models import ProductCheckoutConfiguration

class ProductCheckoutSecurityTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user(username="checkout-user",password="test-pass")
        self.client=APIClient(); self.client.force_authenticate(self.user)
    def test_context_requires_configuration(self):
        response=self.client.get("/api/product-checkout/products/1/context/")
        self.assertIn(response.status_code,(404,))
