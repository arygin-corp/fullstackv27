from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from notifications.models import DeliveryStatus, Notification, NotificationAuditEvent, NotificationDelivery, NotificationPreference, NotificationType
from notifications.services.notifications import NotificationService

class Phase1Tests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="owner", password="pass12345")
        self.other = User.objects.create_user(username="other", password="pass12345")
        self.client.force_login(self.user)

    @patch("notifications.services.notifications.NotificationService.dispatch")
    def test_service_creates_audit_delivery_and_is_idempotent(self, dispatch):
        n, created = NotificationService.create(recipient=self.user, title="Hello", actor=self.user, idempotency_key="evt-1")
        duplicate, duplicate_created = NotificationService.create(recipient=self.user, title="Ignored", idempotency_key="evt-1")
        self.assertTrue(created); self.assertFalse(duplicate_created); self.assertEqual(n.pk, duplicate.pk)
        self.assertTrue(NotificationAuditEvent.objects.filter(notification=n, action="created").exists())
        self.assertTrue(NotificationDelivery.objects.filter(notification=n, status=DeliveryStatus.PENDING).exists())

    def test_read_timestamp_and_audit_are_consistent(self):
        n = Notification.objects.create(recipient=self.user, title="Read me")
        response = self.client.post(reverse("notifications:toggle_read", args=[n.pk]))
        n.refresh_from_db()
        self.assertEqual(response.status_code, 200); self.assertTrue(n.read); self.assertIsNotNone(n.read_at)
        self.assertTrue(n.audit_events.filter(action="marked_read").exists())

    def test_preferences_suppress_optional_but_not_security(self):
        NotificationPreference.objects.create(user=self.user, in_app_enabled=False, system_enabled=False)
        n, created = NotificationService.create(recipient=self.user, title="Optional")
        self.assertIsNone(n); self.assertFalse(created)
        security, created = NotificationService.create(recipient=self.user, title="Security", notification_type=NotificationType.SECURITY)
        self.assertIsNotNone(security); self.assertTrue(created)

    @override_settings(NOTIFICATION_PAGE_SIZE=2)
    def test_unread_pagination_and_isolation(self):
        for i in range(3): Notification.objects.create(recipient=self.user, title=f"Mine {i}")
        Notification.objects.create(recipient=self.other, title="Other")
        data = self.client.get(reverse("notifications:unread"), {"page": 1}).json()
        self.assertEqual(len(data["results"]), 2); self.assertEqual(data["unread_count"], 3); self.assertTrue(data["has_next"])

    def test_cross_user_toggle_is_denied(self):
        n = Notification.objects.create(recipient=self.other, title="Other")
        self.assertEqual(self.client.post(reverse("notifications:toggle_read", args=[n.pk])).status_code, 404)

    @override_settings(NOTIFICATIONS_REDIS_SSE_ENABLED=False)
    def test_sse_feature_flag(self):
        self.assertEqual(self.client.get(reverse("notifications:stream")).status_code, 503)

    def test_preferences_endpoint_is_current_user_only(self):
        response = self.client.post(reverse("notifications:preferences"), {"in_app_enabled": "on", "approval_enabled": "on"})
        self.assertEqual(response.status_code, 302)
        p = NotificationPreference.objects.get(user=self.user)
        self.assertTrue(p.in_app_enabled); self.assertFalse(p.email_enabled)
