from django.test import TestCase
from ..choices import Environment
from ..models import AWSResource,AWSResourceType,AWSService
from ..selectors import get_resource_parity
class ParityTests(TestCase):
    def test_empty_resource_reports_all_missing(self):
        s=AWSService.objects.create(key="s3",name="S3",category="Storage");t=AWSResourceType.objects.create(service=s,key="bucket",name="Bucket");r=AWSResource.objects.create(resource_type=t,key="docs",name="Docs")
        result=get_resource_parity(r);self.assertEqual(len(result["cells"]),5);self.assertFalse(result["is_aligned"])
