from django.core.exceptions import ValidationError
from django.test import TestCase
from ..choices import Environment,HealthStatus,LifecycleStatus
from ..models import AWSAccount,AWSResource,AWSResourceEnvironment,AWSResourceType,AWSService
class ModelTests(TestCase):
    def setUp(self):
        self.service=AWSService.objects.create(key="s3",name="Amazon S3",category="Storage");self.kind=AWSResourceType.objects.create(service=self.service,key="bucket",name="Bucket");self.resource=AWSResource.objects.create(resource_type=self.kind,key="documents",name="Application Documents");self.account=AWSAccount.objects.create(name="Dev",account_id="123456789012",environment=Environment.DEV,default_region="us-east-1")
    def test_environment_choices(self):self.assertEqual(list(Environment.values),["demo","dev","stage","qa","prod"])
    def test_relationships(self):self.assertEqual(self.resource.resource_type.service,self.service)
    def test_unique_environment_configuration(self):
        AWSResourceEnvironment.objects.create(resource=self.resource,environment=Environment.DEV,aws_account=self.account,region="us-east-1",resource_identifier="app-dev")
        with self.assertRaises(Exception):AWSResourceEnvironment.objects.create(resource=self.resource,environment=Environment.DEV,aws_account=self.account,region="us-east-1",resource_identifier="duplicate")
    def test_account_environment_validation(self):
        prod=AWSAccount.objects.create(name="Prod",account_id="210987654321",environment=Environment.PROD,default_region="us-east-1");obj=AWSResourceEnvironment(resource=self.resource,environment=Environment.DEV,aws_account=prod,region="us-east-1",resource_identifier="x")
        with self.assertRaises(ValidationError):obj.full_clean()
