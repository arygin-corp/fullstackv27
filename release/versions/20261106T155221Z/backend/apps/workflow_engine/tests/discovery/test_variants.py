from django.test import SimpleTestCase
from workflow_engine.process_discovery.services import LocalProcessMiner
class DiscoveryTests(SimpleTestCase):
 def test_service_exists(self):self.assertTrue(callable(LocalProcessMiner.variants))
