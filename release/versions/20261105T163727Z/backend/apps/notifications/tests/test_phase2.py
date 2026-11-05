from datetime import timedelta
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from notifications.models import Notification, NotificationDelivery, NotificationMetric, NotificationType, DeliveryChannel, DeliveryStatus
from notifications.monitoring.alerts import evaluate_alerts
from notifications.tasks import enforce_notification_retention

class Phase2Tests(TestCase):
    def setUp(self):
        User=get_user_model(); self.user=User.objects.create_user(username="phase2",password="pass12345"); self.other=User.objects.create_user(username="other2",password="pass12345"); self.client.force_login(self.user)
    def test_versioned_api_is_recipient_scoped_and_filterable(self):
        Notification.objects.create(recipient=self.user,title="Gov",notification_type=NotificationType.GOVERNANCE)
        Notification.objects.create(recipient=self.other,title="Other")
        data=self.client.get(reverse("notifications_api_v1:list"),{"type":"governance"}).json()
        self.assertEqual(data["api_version"],"v1"); self.assertEqual(data["count"],1); self.assertEqual(data["results"][0]["title"],"Gov")
    def test_open_click_and_dismiss_analytics(self):
        n=Notification.objects.create(recipient=self.user,title="Engage")
        self.assertEqual(self.client.post(reverse("notifications_api_v1:open",args=[n.pk])).status_code,200)
        self.client.post(reverse("notifications_api_v1:click",args=[n.pk])); self.client.post(reverse("notifications_api_v1:dismiss",args=[n.pk]))
        n.refresh_from_db(); self.assertIsNotNone(n.opened_at); self.assertIsNotNone(n.clicked_at); self.assertTrue(n.is_deleted)
        data=self.client.get(reverse("notifications_api_v1:analytics")).json(); self.assertEqual(data["opened"],1); self.assertEqual(data["clicked"],1); self.assertEqual(data["dismissed"],1)
    def test_cross_user_analytics_event_denied(self):
        n=Notification.objects.create(recipient=self.other,title="No")
        self.assertEqual(self.client.post(reverse("notifications_api_v1:open",args=[n.pk])).status_code,404)
    @override_settings(NOTIFICATION_READ_RETENTION_DAYS=1,NOTIFICATION_UNREAD_RETENTION_DAYS=2,NOTIFICATION_DELETED_RETENTION_DAYS=1)
    def test_retention_soft_deletes_and_purges(self):
        old=Notification.objects.create(recipient=self.user,title="Old")
        Notification.objects.filter(pk=old.pk).update(created_at=timezone.now()-timedelta(days=3))
        result=enforce_notification_retention(); old.refresh_from_db(); self.assertTrue(old.is_deleted); self.assertEqual(result["soft_deleted_unread"],1)
        Notification.objects.filter(pk=old.pk).update(deleted_at=timezone.now()-timedelta(days=2))
        enforce_notification_retention(); self.assertFalse(Notification.objects.filter(pk=old.pk).exists())
    @override_settings(ALERT_CREATION_FAILURES=2,MONITORING_WINDOW_MINUTES=15)
    def test_creation_failure_alert(self):
        NotificationMetric.objects.create(name="notification_creation_failures_total",value=2)
        report=evaluate_alerts(); self.assertIn("creation_failures",[a["alert"] for a in report["alerts"]])
    def test_metrics_endpoint(self):
        response=self.client.get(reverse("metrics")); self.assertEqual(response.status_code,200); self.assertIn(b"notification_app_info",response.content)
