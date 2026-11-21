from django.test import SimpleTestCase
from workflow_engine.automation.mapping import map_payload
class MappingTests(SimpleTestCase):
 def test_path_mapping(self):self.assertEqual(map_payload({'email':{'$path':'user.email'}},{'user':{'email':'a@example.com'}}),{'email':'a@example.com'})
