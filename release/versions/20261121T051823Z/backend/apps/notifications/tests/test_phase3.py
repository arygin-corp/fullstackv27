from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from notifications.models import DeliveryChannel, DeliveryStatus, DigestFrequency, Notification, NotificationPreference, NotificationRule, NotificationType, RuleAction, TeamsDestination
from notifications.services.notifications import NotificationService
from notifications.services.rules import evaluate_rules
from notifications.services.teams import teams_payload
from notifications.tasks import build_notification_digests, dispatch_notification

class Phase3Tests(TestCase):
    def setUp(self):
        User=get_user_model(); self.user=User.objects.create_user(username="p3",password="pass12345",email="p3@example.com"); self.other=User.objects.create_user(username="other3",password="pass12345"); self.client.force_login(self.user)
    def test_rules_suppress_and_force_channels(self):
        NotificationRule.objects.create(user=self.user,name="Suppress system",notification_type=NotificationType.SYSTEM,action=RuleAction.SUPPRESS,priority=1)
        channels,matched=evaluate_rules(user=self.user,notification_type=NotificationType.SYSTEM,source="app",title="x",default_channels=[DeliveryChannel.IN_APP])
        self.assertEqual(channels,set()); self.assertEqual(len(matched),1)
        n,created=NotificationService.create(recipient=self.user,title="x"); self.assertIsNone(n); self.assertFalse(created)
    @patch("notifications.services.notifications.NotificationService.dispatch")
    def test_force_teams_rule_creates_teams_delivery(self, dispatch):
        NotificationRule.objects.create(user=self.user,name="Teams approvals",notification_type=NotificationType.APPROVAL,action=RuleAction.FORCE_TEAMS,priority=1)
        n,created=NotificationService.create(recipient=self.user,title="Approve",notification_type=NotificationType.APPROVAL)
        self.assertTrue(created); self.assertTrue(n.deliveries.filter(channel=DeliveryChannel.TEAMS).exists())
    def test_teams_payload_excludes_webhook_secret(self):
        n=Notification.objects.create(recipient=self.user,title="Hello",body="Body",url="https://example.com")
        payload=teams_payload(n); self.assertEqual(payload["title"],"Hello"); self.assertNotIn("webhook",str(payload).lower())
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_daily_digest_build_and_delivery(self):
        NotificationPreference.objects.create(user=self.user,digest_frequency=DigestFrequency.DAILY,email_enabled=False)
        n=Notification.objects.create(recipient=self.user,title="Digest item")
        self.assertEqual(build_notification_digests(),1); n.refresh_from_db(); self.assertIsNotNone(n.digest_sent_at); self.assertEqual(len(mail.outbox),1)
    def test_rules_and_teams_pages_are_user_scoped(self):
        self.client.post(reverse("notifications:rules"),{"name":"Mine","priority":"1","action":"allow","stop_processing":"on"})
        self.assertTrue(NotificationRule.objects.filter(user=self.user,name="Mine").exists())
        response=self.client.post(reverse("notifications:teams_destination"),{"name":"My team","webhook_url":"https://example.com/hook","is_active":"on"})
        self.assertEqual(response.status_code,302); self.assertTrue(TeamsDestination.objects.filter(user=self.user).exists())
