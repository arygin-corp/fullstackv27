from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.ai_safety.services import SafetyEngine
class SafetyTests(SimpleTestCase):
 def test_block(self):
  policy=SimpleNamespace(rules=[{'name':'block','when':{'op':'eq','field':'risk','value':'high'}}],block_on_failure=True);self.assertFalse(SafetyEngine.evaluate(policy,{'risk':'high'})['allowed'])
