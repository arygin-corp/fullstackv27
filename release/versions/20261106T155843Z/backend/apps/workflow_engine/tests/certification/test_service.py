from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.certification.services import CertificationService
class CertificationTests(SimpleTestCase):
 def test_missing_requirement(self):
  review=SimpleNamespace(profile=SimpleNamespace(requirements=[{'key':'security'}]),evidence={},findings=[]);self.assertFalse(CertificationService.evaluate(review)['passed'])
