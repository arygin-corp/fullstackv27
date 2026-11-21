from django.db import connection
from django.db.migrations.loader import MigrationLoader
from django.test import SimpleTestCase


class MigrationGraphTests(SimpleTestCase):
    databases = {"default"}

    def test_marketplace_has_one_leaf_migration(self):
        loader = MigrationLoader(connection, ignore_no_migrations=True)
        leaves = [node for node in loader.graph.leaf_nodes() if node[0] == "marketplace"]
        self.assertEqual(leaves, [("marketplace", "0052_phase3_search_infrastructure")])
