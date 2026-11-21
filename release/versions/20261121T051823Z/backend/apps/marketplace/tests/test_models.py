from django.contrib.auth import get_user_model

from apps.marketplace.models import Product
from .base import MarketplaceTestCase


class ProductModelTests(MarketplaceTestCase):
    def test_duplicate_names_receive_unique_slugs(self):
        first = Product.objects.create(name="Customer Data", is_active=True)
        second = Product.objects.create(name="Customer Data", is_active=True)

        self.assertEqual(first.slug, "customer-data")
        self.assertEqual(second.slug, "customer-data-2")

    def test_published_manager_requires_approval_and_active_state(self):
        visible = Product.objects.create(name="Visible", status="approved", is_active=True)
        Product.objects.create(name="Draft", status="draft", is_active=True)
        Product.objects.create(name="Inactive", status="approved", is_active=False)

        self.assertQuerySetEqual(Product.objects.published(), [visible])

    def test_approval_timestamp_is_reset_when_status_changes(self):
        user = get_user_model().objects.create_user(username="owner")
        product = Product.objects.create(
            name="Governed Product",
            status="approved",
            approved_by=user,
            is_active=True,
        )
        self.assertIsNotNone(product.approved_at)

        product.status = "draft"
        product.save()
        product.refresh_from_db()
        self.assertIsNone(product.approved_at)
        self.assertIsNone(product.approved_by)

    def test_initial_save_assigns_sku_without_recursive_save(self):
        product = Product.objects.create(name="SKU Product")
        self.assertTrue(product.sku)
        self.assertTrue(product.sku.endswith(str(product.pk).zfill(3)))
