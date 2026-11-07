from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.test import TestCase, override_settings
from notifications.chaos import validate_chaos_request
from notifications.ledger import append_ledger_entry, create_checkpoint, verify_ledger
from notifications.models import AuditLedgerEntry, NotificationType
from notifications.services.notifications import NotificationService

class Phase10Tests(TestCase):
    def setUp(self): self.user=get_user_model().objects.create_user("phase10",password="x")
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_event_sourcing_writes_hash_chained_ledger(self,dispatch):
        n,_=NotificationService.create(recipient=self.user,title="Ledger",notification_type=NotificationType.SYSTEM)
        entries=list(AuditLedgerEntry.objects.order_by("sequence")); self.assertGreaterEqual(len(entries),3)
        self.assertEqual(entries[0].previous_hash,"0"*64)
        for previous,current in zip(entries,entries[1:]): self.assertEqual(current.previous_hash,previous.entry_hash)
        result=verify_ledger(); self.assertEqual(result.status,"passed")
    def test_ledger_payload_digest_excludes_sensitive_content(self):
        entry=append_ledger_entry(event_type="test",aggregate_type="Test",aggregate_id="1",correlation_id="00000000-0000-0000-0000-000000000001",payload={"body":"secret","token":"secret","safe":"yes"})
        self.assertNotIn("secret",entry.payload_digest); self.assertEqual(len(entry.payload_digest),64)
    def test_checkpoint_is_signed(self):
        append_ledger_entry(event_type="test",aggregate_type="Test",aggregate_id="1",correlation_id="00000000-0000-0000-0000-000000000001",payload={})
        checkpoint=create_checkpoint(); self.assertEqual(len(checkpoint.signature),64)
    @override_settings(KUBERNETES_DEPLOYMENT_ENABLED=False,CHAOS_ENGINEERING_ENABLED=False)
    def test_chaos_off_by_default(self):
        with self.assertRaises(PermissionDenied): validate_chaos_request(environment="dev",duration_seconds=30,affected_replicas=1)
    @override_settings(KUBERNETES_DEPLOYMENT_ENABLED=True,CHAOS_ENGINEERING_ENABLED=True,CHAOS_ALLOWED_ENVIRONMENTS="dev,qa",CHAOS_ALLOW_PRODUCTION=False,CHAOS_MAX_DURATION_SECONDS=300,CHAOS_MAX_AFFECTED_REPLICAS=1)
    def test_chaos_safety_gates(self):
        self.assertTrue(validate_chaos_request(environment="dev",duration_seconds=30,affected_replicas=1))
        with self.assertRaises(PermissionDenied): validate_chaos_request(environment="production",duration_seconds=30,affected_replicas=1)
        with self.assertRaises(ValueError): validate_chaos_request(environment="qa",duration_seconds=301,affected_replicas=1)
        with self.assertRaises(ValueError): validate_chaos_request(environment="qa",duration_seconds=30,affected_replicas=2)
