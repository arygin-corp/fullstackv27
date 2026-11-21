from django.contrib.auth import get_user_model
from django.test import RequestFactory

from apps.marketplace.models import Product
from apps.marketplace.views import approve_product
from .base import MarketplaceTestCase


class ProductApprovalTests(MarketplaceTestCase):
    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
        self.admin = get_user_model().objects.create_superuser(
            username="approver", email="approver@example.test", password="test-password"
        )
        self.product = Product.objects.create(name="Pending", status="pending", is_active=True)

    def test_approval_rejects_get(self):
        request = self.factory.get("/")
        request.user = self.admin
        response = approve_product(request, self.product.pk)
        self.assertEqual(response.status_code, 405)

    def test_approval_records_auditor_and_timestamp(self):
        request = self.factory.post("/")
        request.user = self.admin
        response = approve_product(request, self.product.pk)
        self.assertEqual(response.status_code, 302)

        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "approved")
        self.assertEqual(self.product.approved_by, self.admin)
        self.assertIsNotNone(self.product.approved_at)
