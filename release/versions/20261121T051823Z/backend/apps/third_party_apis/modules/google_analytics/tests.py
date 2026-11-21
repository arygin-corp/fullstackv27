import json
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase

from apps.third_party_apis.modules.google_analytics import connection


class GoogleAnalyticsConnectionTests(SimpleTestCase):
    def test_property_id_accepts_the_admin_number(self):
        self.assertEqual(connection.clean_property_id("properties/123456789"), "123456789")
        self.assertEqual(connection.clean_property_id("GA-123"), "")

    def test_service_account_file_must_be_a_key(self):
        account, message = connection.parse_service_account(json.dumps({
            "type": "service_account",
            "client_email": "analytics@example.iam.gserviceaccount.com",
            "private_key": "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
        }))
        self.assertEqual(message, "")
        self.assertEqual(account["client_email"], "analytics@example.iam.gserviceaccount.com")
        rejected, error = connection.parse_service_account('{"type": "user"}')
        self.assertIsNone(rejected)
        self.assertIn("service account", error)

    def test_save_keeps_the_key_off_the_public_record(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "google_analytics.json"
            with patch.object(connection, "store_path", return_value=path):
                ok, message = connection.save_connection("123456789", json.dumps({
                    "type": "service_account",
                    "client_email": "analytics@example.iam.gserviceaccount.com",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
                }))
                shown = connection.public_connection()
        self.assertTrue(ok)
        self.assertIn("saved", message)
        self.assertTrue(shown["connected"])
        self.assertNotIn("private_key", shown)
        self.assertNotIn("BEGIN PRIVATE KEY", json.dumps(shown))
