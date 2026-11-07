from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.citizen_studio.services import CitizenStudioService
class CitizenTests(SimpleTestCase):
 def test_requires_start_and_end(self):
  result=CitizenStudioService.readiness(SimpleNamespace(canvas={'nodes':[]},risk_tier='low'));self.assertFalse(result['ready'])
