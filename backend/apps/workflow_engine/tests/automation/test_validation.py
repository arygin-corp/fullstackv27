from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.automation.engine import AutomationEngine
class QS:
 def __init__(self,values):self.values=values
 def all(self):return self.values
class FlowValidationTests(SimpleTestCase):
 def test_requires_trigger(self):self.assertTrue(AutomationEngine.validate(SimpleNamespace(nodes=QS([]),edges=QS([]))))
