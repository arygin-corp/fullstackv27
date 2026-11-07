from datetime import datetime

from django.test import SimpleTestCase

from apps.third_party_apis.modules.onets_order_history.services import (
    build_request_search,
    calculate_due_date,
    to_camel_case,
)


class OrderHistoryServiceTests(SimpleTestCase):
    def test_camel_case_matches_the_node_transform(self):
        converted = to_camel_case({"ritm_state": "Open", "task_number": "TASK1", "empty": ""}, "task_")
        self.assertEqual(converted["ritmState"], "Open")
        self.assertEqual(converted["number"], "TASK1")
        self.assertNotIn("empty", converted)

    def test_request_search_keeps_the_servicenow_filters(self):
        query = build_request_search({"requestedFor": "abc", "catalogItem": "99"})
        self.assertIn("&request.requested_for.u_ad_object_id=abc", query)
        self.assertIn("&cat_item=99", query)

    def test_due_date_skips_weekends(self):
        friday = datetime(2024, 1, 5)
        due = calculate_due_date(friday, 2)
        self.assertEqual(due.date().isoformat(), "2024-01-09")
