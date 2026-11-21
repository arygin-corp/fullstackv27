from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from notifications.models import Notification
from notifications.utils import create_notification

class NotificationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="owner", password="pass12345")
        self.other = User.objects.create_user(username="other", password="pass12345")
        self.client.force_login(self.user)

    def test_create_notification(self):
        item = create_notification(recipient=self.user, title=" Test ", url="https://example.com")
        self.assertEqual(item.title, "Test")

    def test_unread_is_scoped_to_current_user(self):
        Notification.objects.create(recipient=self.user, title="Mine")
        Notification.objects.create(recipient=self.other, title="Not mine")
        response = self.client.get(reverse("notifications:unread"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual([x["title"] for x in response.json()["notifications"]], ["Mine"])

    def test_toggle_requires_post_and_owner(self):
        mine = Notification.objects.create(recipient=self.user, title="Mine")
        other = Notification.objects.create(recipient=self.other, title="Other")
        self.assertEqual(self.client.get(reverse("notifications:toggle_read", args=[mine.id])).status_code, 405)
        self.assertEqual(self.client.post(reverse("notifications:toggle_read", args=[other.id])).status_code, 404)
        self.assertTrue(self.client.post(reverse("notifications:toggle_read", args=[mine.id])).json()["read_status"])

    def test_mark_all_read_only_updates_current_user(self):
        Notification.objects.create(recipient=self.user, title="Mine")
        other = Notification.objects.create(recipient=self.other, title="Other")
        response = self.client.post(reverse("notifications:mark_all_read"))
        self.assertEqual(response.json()["marked_count"], 1)
        other.refresh_from_db()
        self.assertFalse(other.read)
