from unittest.mock import patch

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, SimpleTestCase

from apps.notifications.models import NotificationType
from apps.notifications.services.ingress import notification_type_for, publish
from gdx.context_processors import header_account, header_notifications


class NotificationIngressTests(SimpleTestCase):
    def test_review_requests_are_approvals(self):
        self.assertEqual(notification_type_for("review_required"), NotificationType.APPROVAL)
        self.assertEqual(notification_type_for("intake_approved"), NotificationType.GOVERNANCE)
        self.assertEqual(notification_type_for("product_available"), NotificationType.SYSTEM)

    @patch("apps.notifications.services.notifications.NotificationService.create", side_effect=RuntimeError("unavailable"))
    def test_a_delivery_failure_does_not_escape_to_the_source_app(self, _create):
        notification, created = publish(recipient=object(), title="Approval needed")
        self.assertIsNone(notification)
        self.assertFalse(created)


class HeaderNotificationTests(SimpleTestCase):
    def test_signed_out_bell_is_empty(self):
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        data = header_notifications(request)
        self.assertEqual(data["header_notifications"], [])
        self.assertEqual(data["header_notification_unread"], 0)


class HeaderAccountTests(SimpleTestCase):
    def test_initials_come_from_the_first_and_last_name(self):
        class Person:
            is_authenticated = True
            first_name = "Giovanni"
            last_name = "Rossi"
            is_staff = False
            is_superuser = False

            def get_username(self):
                return "grossi"

            @property
            def profile(self):
                raise AttributeError("no profile")

        request = RequestFactory().get("/")
        request.user = Person()
        data = header_account(request)
        self.assertEqual(data["header_user_initials"], "GR")
        self.assertEqual(data["header_user_image"], "")
        self.assertEqual(data["header_user_name"], "Giovanni Rossi")
