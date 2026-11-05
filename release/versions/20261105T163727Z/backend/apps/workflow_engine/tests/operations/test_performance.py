from django.test import SimpleTestCase
from workflow_engine.performance.validator import PerformanceValidator
class PerformanceTests(SimpleTestCase):
 def test_threshold(self):self.assertFalse(PerformanceValidator.evaluate({'p95_ms':500},{'p95_ms':300})['passed'])
