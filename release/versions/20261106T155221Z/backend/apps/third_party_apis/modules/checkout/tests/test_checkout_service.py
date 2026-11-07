from unittest.mock import Mock
from django.test import SimpleTestCase
from ..services.one_ts_client import OneTSClient
class OneTSSessionTests(SimpleTestCase):
 def test_same_session_used_for_adds_and_submit(self):
  session=Mock(); session.headers={}; session.post.return_value.ok=True; session.post.return_value.json.side_effect=[{"cart_item_id":"1"},{"cart_item_id":"2"},{"request_number":"REQ1"}]
  client=OneTSClient(session=session); client.add_url="add"; client.submit_url="submit"; client.add_to_cart({},1); client.add_to_cart({},1); client.submit_cart()
  self.assertEqual(session.post.call_count,3)
