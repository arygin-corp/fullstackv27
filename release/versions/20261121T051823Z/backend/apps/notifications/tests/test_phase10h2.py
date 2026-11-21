from django.test import TestCase,override_settings
from django.urls import reverse
from notifications.secrets import SecretProviderError,resolve_secret
class HealthTests(TestCase):
    def test_live(self): self.assertEqual(self.client.get("/health/live/").status_code,200)
    def test_ready(self): self.assertEqual(self.client.get("/health/ready/").status_code,200)
    def test_startup(self): self.assertEqual(self.client.get("/health/startup/").status_code,200)
    @override_settings(APP_ENV="production",MONITORING_TOKEN="secret")
    def test_metrics_requires_token(self):
        self.assertEqual(self.client.get("/monitoring/metrics/").status_code,401)
        self.assertEqual(self.client.get("/monitoring/metrics/",HTTP_AUTHORIZATION="Bearer secret").status_code,200)
class SecretTests(TestCase):
    def test_legacy_secret_is_supported(self): self.assertEqual(resolve_secret("","legacy"),"legacy")
    def test_missing_secret_fails(self):
        with self.assertRaises(SecretProviderError): resolve_secret("")
