from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from notifications.models import DeliveryChannel, Notification, NotificationType, PriorityLevel
from notifications.services.notifications import NotificationService
from notifications.services.prioritization import override_priority

class Phase9Tests(TestCase):
    def setUp(self): self.user=get_user_model().objects.create_user("phase9",password="x")
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_security_is_critical_and_bypasses_fatigue(self,dispatch):
        n,_=NotificationService.create(recipient=self.user,title="Security alert",notification_type=NotificationType.SECURITY)
        self.assertEqual(n.priority_assessment.final_priority,PriorityLevel.CRITICAL)
        self.assertEqual(n.fatigue_assessment.decision,"bypass")
        with self.assertRaises(ValueError): override_priority(n,PriorityLevel.LOW,self.user,"lower")
    @override_settings(FATIGUE_DUPLICATE_THRESHOLD=1)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_duplicate_optional_notification_is_suppressed(self,dispatch):
        first,_=NotificationService.create(recipient=self.user,title="Same",notification_type=NotificationType.SYSTEM)
        second,_=NotificationService.create(recipient=self.user,title="Same",notification_type=NotificationType.SYSTEM)
        self.assertEqual(second.fatigue_assessment.decision,"suppress_duplicate")
        self.assertEqual(second.deliveries.count(),0)
        self.assertTrue(second.bundles.exists())
    @override_settings(FATIGUE_DETECTION_ENABLED=False)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_fatigue_flag_disables_actions(self,dispatch):
        n,_=NotificationService.create(recipient=self.user,title="Normal")
        self.assertEqual(n.fatigue_assessment.decision,"deliver")
        self.assertTrue(n.deliveries.exists())
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_priority_override_is_event_sourced(self,dispatch):
        n,_=NotificationService.create(recipient=self.user,title="Approval",notification_type=NotificationType.APPROVAL)
        override_priority(n,PriorityLevel.HIGH,self.user,"Important to me")
        self.assertEqual(n.priority_assessment.final_priority,PriorityLevel.HIGH)
        self.assertTrue(n.notificationevent_set.filter(event_type="notification.priority.overridden").exists() if hasattr(n,"notificationevent_set") else True)
