from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.workflow_gps.services import WorkflowGPS
class GPSTests(SimpleTestCase):
 def test_fastest(self):
  a=SimpleNamespace(estimated_duration=5,estimated_cost=1,risk_score=2);b=SimpleNamespace(estimated_duration=2,estimated_cost=4,risk_score=3);self.assertIs(WorkflowGPS.choose([a,b],'fastest'),b)
