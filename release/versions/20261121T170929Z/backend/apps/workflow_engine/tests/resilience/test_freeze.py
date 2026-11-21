from django.test import SimpleTestCase
from workflow_engine.resilience.models import ExecutionFreeze
class FreezeModelTests(SimpleTestCase):
 def test_scopes(self):self.assertIn(('global','Global'),ExecutionFreeze.Scope.choices)
