from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from notifications.models import DeadLetterStatus, NotificationDeadLetter, NotificationOutbox, OutboxStatus
from notifications.services.notifications import NotificationService
from notifications.services.outbox import requeue_dead_letter
from notifications.tasks import process_outbox_event, recover_stale_outbox_locks

class Phase4Tests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user(username="p4",password="pass12345")
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_creation_writes_atomic_outbox(self, dispatch):
        n,created=NotificationService.create(recipient=self.user,title="Reliable",idempotency_key="p4-1")
        self.assertTrue(created)
        event=NotificationOutbox.objects.get(notification=n)
        self.assertEqual(event.status,OutboxStatus.PENDING)
        self.assertEqual(event.payload["notification_id"],n.pk)
    @patch("notifications.tasks.deliver_notification")
    def test_outbox_marks_processed(self, deliver):
        n,_=NotificationService.create(recipient=self.user,title="Deliver")
        event=NotificationOutbox.objects.get(notification=n)
        self.assertTrue(process_outbox_event(event.pk))
        event.refresh_from_db(); self.assertEqual(event.status,OutboxStatus.PROCESSED); self.assertIsNotNone(event.processed_at)
    @override_settings(OUTBOX_MAX_ATTEMPTS=1)
    @patch("notifications.tasks.deliver_notification",side_effect=ConnectionError("broker down"))
    def test_exhausted_event_moves_to_dead_letter(self, deliver):
        n,_=NotificationService.create(recipient=self.user,title="Fail")
        event=NotificationOutbox.objects.get(notification=n)
        self.assertFalse(process_outbox_event(event.pk))
        event.refresh_from_db(); self.assertEqual(event.status,OutboxStatus.DEAD_LETTERED)
        dlq=NotificationDeadLetter.objects.get(outbox_event=event); self.assertEqual(dlq.status,DeadLetterStatus.OPEN); self.assertEqual(dlq.retry_count,1)
    @override_settings(OUTBOX_MAX_ATTEMPTS=1)
    @patch("notifications.tasks.deliver_notification",side_effect=ConnectionError("broker down"))
    def test_dead_letter_requeue_resets_outbox_and_audits(self, deliver):
        n,_=NotificationService.create(recipient=self.user,title="Requeue")
        event=NotificationOutbox.objects.get(notification=n); process_outbox_event(event.pk)
        dlq=NotificationDeadLetter.objects.get(outbox_event=event); requeue_dead_letter(dlq,actor=self.user)
        event.refresh_from_db(); dlq.refresh_from_db()
        self.assertEqual(event.status,OutboxStatus.PENDING); self.assertEqual(event.attempt_count,0); self.assertEqual(dlq.status,DeadLetterStatus.REQUEUED)
        self.assertTrue(n.audit_events.filter(action="dead_letter_requeued").exists())
    @override_settings(OUTBOX_LOCK_TIMEOUT_SECONDS=1)
    def test_stale_lock_recovery(self):
        from datetime import timedelta
        n,_=NotificationService.create(recipient=self.user,title="Stale")
        event=NotificationOutbox.objects.get(notification=n)
        NotificationOutbox.objects.filter(pk=event.pk).update(status=OutboxStatus.PROCESSING,locked_at=timezone.now()-timedelta(seconds=5))
        self.assertEqual(recover_stale_outbox_locks(),1)
        event.refresh_from_db(); self.assertEqual(event.status,OutboxStatus.FAILED); self.assertEqual(event.last_error_code,"stale_lock")
