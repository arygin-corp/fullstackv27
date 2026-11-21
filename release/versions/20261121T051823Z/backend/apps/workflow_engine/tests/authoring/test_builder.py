from django.test import SimpleTestCase
from workflow_engine.builder.services import BuilderService
class BuilderTests(SimpleTestCase):
 def test_invalid_endpoint(self):
  data={'workflow':{'key':'x'},'states':[{'key':'a'}],'transitions':[{'key':'go','source':'a','target':'b'}],'roles':['owner']};self.assertTrue(BuilderService.validate_blueprint(data))
