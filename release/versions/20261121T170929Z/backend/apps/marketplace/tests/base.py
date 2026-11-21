from contextlib import ExitStack
from unittest.mock import patch

from django.test import TestCase


class MarketplaceTestCase(TestCase):
    """Prevents unit tests from dispatching external Celery work."""

    def setUp(self):
        super().setUp()
        self._patches = ExitStack()
        for target in (
            "apps.marketplace.signals.export_products_task.delay",
            "apps.marketplace.signals.export_domains_task.delay",
            "apps.marketplace.signals.export_ad_groups_task.delay",
            "apps.marketplace.signals.export_orders_task.delay",
            "apps.marketplace.signals.run_denodo_export_sequence.delay",
            "apps.marketplace.signals.generate_product_embedding.delay",
        ):
            self._patches.enter_context(patch(target))

    def tearDown(self):
        self._patches.close()
        super().tearDown()
