from django.test import TestCase
from ..choices import Environment,HealthStatus
from ..models import AWSAccount,AWSResource,AWSResourceEnvironment,AWSResourceType,AWSService
from ..selectors import get_resource_parity
class SelectorTests(TestCase):
    def setUp(self):
        s=AWSService.objects.create(key="s3",name="S3",category="Storage");t=AWSResourceType.objects.create(service=s,key="bucket",name="Bucket");self.r=AWSResource.objects.create(resource_type=t,key="docs",name="Documents")
    def add(self,env,required=True,enabled=True,region="us-east-1",metadata=None):
        a=AWSAccount.objects.create(name=env,account_id=str(100000000000+len(AWSAccount.objects.all())+1),environment=env,default_region=region);return AWSResourceEnvironment.objects.create(resource=self.r,environment=env,aws_account=a,region=region,resource_identifier=env,required=required,enabled=enabled,metadata=metadata or {},health_status=HealthStatus.HEALTHY)
    def test_missing_environment(self):self.add(Environment.DEV);self.assertFalse(get_resource_parity(self.r)["is_aligned"])
    def test_disabled_resource(self):self.add(Environment.DEV,enabled=False);self.assertTrue(any(x["code"]=="disabled" for x in get_resource_parity(self.r)["cells"]))
    def test_region_mismatch(self):
        for env in Environment.values:self.add(env,region="us-west-2" if env==Environment.QA else "us-east-1")
        self.assertTrue(any("region differs" in x.get("differences",[]) for x in get_resource_parity(self.r)["cells"]))
