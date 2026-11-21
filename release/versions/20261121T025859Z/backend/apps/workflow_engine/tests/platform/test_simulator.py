from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.digital_twin.simulator import DigitalTwinSimulator
class SimulatorTests(SimpleTestCase):
 def test_deterministic_seed(self):
  s=SimpleNamespace(iterations=10,service_times={'review':{'min':1,'max':2}},cost_rates={'review':3});self.assertEqual(DigitalTwinSimulator.run(s,7),DigitalTwinSimulator.run(s,7))
