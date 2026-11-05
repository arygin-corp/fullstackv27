from types import SimpleNamespace
from django.test import SimpleTestCase
from workflow_engine.migrations_engine.services import MigrationService
class MigrationValidationTests(SimpleTestCase):
 def test_unknown_mapping(self):
  class States:
   def __init__(self,keys):self.keys=keys
   def all(self):return [SimpleNamespace(key=k) for k in self.keys]
  plan=SimpleNamespace(source=SimpleNamespace(states=States(['a'])),target=SimpleNamespace(states=States(['b'])),state_mapping={'x':'b'});self.assertTrue(MigrationService.validate(plan))
