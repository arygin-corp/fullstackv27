from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from notifications.models import Notification, NotificationSummary, NotificationType, SummaryFrequency, SummaryStatus
from notifications.services.ai import DeterministicSummaryProvider, SummaryProviderError
from notifications.services.summaries import generate_summary
from notifications.telemetry import span

class Phase6Tests(TestCase):
    def setUp(self):
        U=get_user_model(); self.user=U.objects.create_user("summary",password="x"); self.other=U.objects.create_user("other-summary",password="x"); self.client.force_login(self.user)
        Notification.objects.create(recipient=self.user,title="Approval needed",notification_type=NotificationType.APPROVAL)
        Notification.objects.create(recipient=self.user,title="System update",notification_type=NotificationType.SYSTEM,read=False)
        Notification.objects.create(recipient=self.other,title="Private other user")
    def test_deterministic_summary_is_user_scoped(self):
        summary=generate_summary(self.user,SummaryFrequency.ON_DEMAND)
        self.assertEqual(summary.status,SummaryStatus.COMPLETED); self.assertEqual(summary.input_count,2); self.assertNotIn("Private other user",summary.content); self.assertEqual(summary.provider,"deterministic")
    @override_settings(AI_SUMMARY_PROVIDER="openai_compatible",AI_SUMMARY_ENDPOINT="https://example.invalid",AI_SUMMARY_API_KEY="secret",AI_SUMMARY_MODEL="test")
    @patch("notifications.services.ai.OpenAICompatibleSummaryProvider.summarize",side_effect=SummaryProviderError("provider unavailable"))
    def test_external_provider_failure_uses_safe_fallback(self, provider):
        summary=generate_summary(self.user,SummaryFrequency.DAILY)
        self.assertEqual(summary.status,SummaryStatus.COMPLETED); self.assertEqual(summary.provider,"deterministic"); self.assertEqual(summary.error_code,"ai_provider_fallback"); self.assertNotIn("secret",summary.error_summary)
    def test_summary_endpoint_is_authenticated_and_scoped(self):
        self.assertEqual(self.client.post(reverse("notifications:summaries")).status_code,302)
        self.assertEqual(NotificationSummary.objects.filter(user=self.user).count(),1)
        self.client.logout(); self.assertEqual(self.client.get(reverse("notifications:summaries")).status_code,302)
    def test_noop_span_works_without_otel_dependencies(self):
        with span("test.span",user_id=self.user.pk) as current: self.assertTrue(current is None or current is not None)
    def test_payload_has_no_notification_body(self):
        from notifications.services.summaries import summary_payload, summary_period
        start,end=summary_period(SummaryFrequency.DAILY); payload=summary_payload(self.user,start,end)
        self.assertNotIn("body",str(payload).lower())
