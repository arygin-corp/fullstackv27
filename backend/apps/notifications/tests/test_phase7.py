from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from notifications.models import NotificationEvent, PushDevice, PushProvider, PushPlatform
from notifications.services.eventsourcing import append_event, notification_state_from_events, sanitize_payload
from notifications.services.notifications import NotificationService
from notifications.services.push import PushDisabled, decrypt_token, register_device

class Phase7Tests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user("phase7",password="x")
        self.client.force_login(self.user)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_creation_and_read_emit_versioned_events(self, dispatch):
        n,_=NotificationService.create(recipient=self.user,title="Event sourced")
        NotificationService.set_read(notification=n,read=True,actor=self.user)
        events=NotificationEvent.objects.filter(aggregate_id=str(n.pk)).order_by("aggregate_version")
        versions=list(events.values_list("aggregate_version",flat=True))
        self.assertEqual(versions,list(range(1,len(versions)+1)))
        self.assertTrue(events.filter(event_type="notification.created").exists())
        self.assertTrue(events.filter(event_type="notification.read").exists())
        state=notification_state_from_events(n.pk); self.assertTrue(state["read"]); self.assertEqual(state["title"],"Event sourced")
    def test_sensitive_event_keys_are_removed(self):
        clean=sanitize_payload({"token":"secret","webhook_url":"secret","title":"safe"})
        self.assertEqual(clean,{"title":"safe"})
    @override_settings(MOBILE_PUSH_ENABLED=False)
    def test_mobile_push_is_off_by_default(self):
        self.assertEqual(self.client.get(reverse("notifications:push_devices")).status_code,503)
        with self.assertRaises(PushDisabled): register_device(user=self.user,provider=PushProvider.FCM,platform=PushPlatform.ANDROID,device_identifier="d1",token="secret")
    @override_settings(MOBILE_PUSH_ENABLED=True)
    def test_device_registration_is_encrypted_and_user_scoped(self):
        device=register_device(user=self.user,provider=PushProvider.FCM,platform=PushPlatform.ANDROID,device_identifier="d1",token="secret-token")
        self.assertNotIn("secret-token",device.token_encrypted); self.assertEqual(decrypt_token(device.token_encrypted),"secret-token")
        other=get_user_model().objects.create_user("phase7-other",password="x")
        other_device=register_device(user=other,provider=PushProvider.FCM,platform=PushPlatform.ANDROID,device_identifier="d2",token="other-token")
        self.assertEqual(self.client.post(reverse("notifications:push_device_delete",args=[other_device.pk])).status_code,404)
    @override_settings(MOBILE_PUSH_ENABLED=False)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_push_delivery_not_created_when_disabled(self, dispatch):
        pref=self.user.notification_preference if hasattr(self.user,"notification_preference") else None
        if pref is None:
            from notifications.models import NotificationPreference
            pref=NotificationPreference.objects.create(user=self.user,mobile_push_enabled=True)
        else: pref.mobile_push_enabled=True; pref.save()
        n,_=NotificationService.create(recipient=self.user,title="No push")
        self.assertFalse(n.deliveries.filter(channel="push").exists())
