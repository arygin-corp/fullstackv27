from django.test import SimpleTestCase
from workflow_engine.sdk.decorators import REGISTRY,workflow_action
class SDKTests(SimpleTestCase):
 def test_register(self):
  @workflow_action('demo')
  def fn():return 1
  self.assertIs(REGISTRY['actions']['demo'],fn)
