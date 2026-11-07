from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.flow_analysis.services import FlowAnalyzer
class CycleTests(SimpleTestCase):
 def test_cycle(self):
  nodes=[SimpleNamespace(node_id='a'),SimpleNamespace(node_id='b')];edges=[SimpleNamespace(source='a',target='b'),SimpleNamespace(source='b',target='a')];self.assertTrue(FlowAnalyzer.cycles(nodes,edges))
