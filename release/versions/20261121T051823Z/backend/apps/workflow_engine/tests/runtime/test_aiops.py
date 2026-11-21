from django.test import SimpleTestCase
from workflow_engine.aiops.services import AnomalyDetector
class AIOpsTests(SimpleTestCase):
 def test_anomaly(self):self.assertTrue(AnomalyDetector.zscore([1,1,1,1.1],10,2)['anomaly'])
