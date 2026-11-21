from unittest.mock import patch

from apps.marketplace.models import Product, SearchProductEmbedding
from apps.marketplace.tasks import generate_product_embedding
from .base import MarketplaceTestCase


class EmbeddingTaskTests(MarketplaceTestCase):
    @patch("apps.marketplace.tasks.encode_search_text", return_value=[0.0] * 384)
    def test_embedding_task_updates_single_record(self, encode):
        product = Product.objects.create(name="Semantic Product", status="approved", is_active=True)

        result = generate_product_embedding.run(product.pk)

        self.assertEqual(result["status"], "updated")
        self.assertEqual(SearchProductEmbedding.objects.filter(product=product).count(), 1)
        self.assertIn("Semantic Product", SearchProductEmbedding.objects.get(product=product).metadata)
        encode.assert_called_once()

    def test_missing_product_is_an_intentional_noop(self):
        result = generate_product_embedding.run(999999)
        self.assertEqual(result["status"], "not_found")
