from types import SimpleNamespace
from unittest.mock import patch
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase
from apps.external_apis.domain_services import add_to_cart, tdsp_pods, upload_attachment
from apps.external_apis.graph_services import sort_by_name_relevance
from apps.external_apis.runtime import enforce_rate_limit
class ParityTests(SimpleTestCase):
    def request(self): return SimpleNamespace(correlation_id="00000000-0000-0000-0000-000000000001")
    @patch("apps.external_apis.domain_services.execute_api")
    def test_pods_raw(self,execute):
        execute.return_value=[{"u_primary":"A"}]; self.assertEqual(tdsp_pods(self.request()),[{"u_primary":"A"}])
    @patch("apps.external_apis.domain_services.execute_api")
    def test_cart_numeric_quantity(self,execute):
        execute.return_value={}; add_to_cart(self.request(),{"variables":{},"sysparm_quantity":2}); self.assertEqual(execute.call_args.kwargs["json_body"]["sysparm_quantity"],"2")
    @patch("apps.external_apis.domain_services.execute_api")
    def test_multipart_file(self,execute):
        f=SimpleUploadedFile("a.txt",b"hello",content_type="text/plain"); upload_attachment(self.request(),"x","1",f); self.assertEqual(execute.call_args.kwargs["files"]["file"][0],"a.txt")
    def test_graph_exact_first(self):
        data={"value":[{"displayName":"John Smithson"},{"displayName":"John Smith"}]}; self.assertEqual(sort_by_name_relevance(data,{"search":{"displayName":"John Smith"}})["value"][0]["displayName"],"John Smith")
    def test_rate_remaining(self):
        cache.clear(); ep=SimpleNamespace(pk=1,requests_per_minute=100,requests_per_day=10000); app=SimpleNamespace(pk=2); self.assertEqual(enforce_rate_limit(ep,app),99); self.assertEqual(enforce_rate_limit(ep,app),98)
