from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase, override_settings
from notifications.models import AudienceCondition, AudienceOperator, DynamicAudience, NotificationCampaign, NotificationTenant, NotificationTemplate, NotificationTemplateVersion, RegisteredApplication, TenantMembership
from notifications.services.audiences import create_snapshot, evaluate_audience, validate_condition
from notifications.services.notifications import NotificationService
from notifications.services.tenancy import resolve_request_context

class Phase8Tests(TestCase):
    def setUp(self):
        U=get_user_model(); self.user=U.objects.create_user("tenant-user",password="x",email="u@example.com"); self.other=U.objects.create_user("other-tenant-user",password="x",is_staff=True)
        self.tenant=NotificationTenant.objects.create(key="tenant-a",name="Tenant A"); self.app=RegisteredApplication.objects.create(tenant=self.tenant,key="marketplace",name="Marketplace")
        TenantMembership.objects.create(tenant=self.tenant,user=self.user)
    @override_settings(MULTI_TENANCY_ENABLED=False)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_single_tenant_behavior_remains_when_disabled(self, dispatch):
        n,created=NotificationService.create(recipient=self.user,title="Legacy"); self.assertTrue(created); self.assertIsNone(n.tenant_id)
    @override_settings(MULTI_TENANCY_ENABLED=True,DEFAULT_TENANT_KEY="tenant-a")
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_enabled_service_requires_and_records_tenant(self, dispatch):
        n,created=NotificationService.create(recipient=self.user,title="Scoped",tenant=self.tenant,application=self.app); self.assertTrue(created); self.assertEqual(n.tenant,self.tenant); self.assertEqual(n.outbox_events.get().tenant,self.tenant); self.assertEqual(n.events.count() if hasattr(n,"events") else 0,0)
    def test_dynamic_audience_exclusion_wins_and_snapshot_is_immutable(self):
        a=DynamicAudience.objects.create(tenant=self.tenant,name="Staff except other",exclude_user_ids=[self.other.pk],created_by=self.user)
        AudienceCondition.objects.create(audience=a,field="is_staff",operator=AudienceOperator.IS_TRUE,value=True)
        self.assertEqual(list(evaluate_audience(a)),[])
        a.exclude_user_ids=[]; a.save(); snapshot=create_snapshot(a,actor=self.user); self.assertEqual(snapshot.member_count,1)
        self.other.is_staff=False; self.other.save(); self.assertEqual(snapshot.members.count(),1)
    def test_protected_characteristic_is_rejected(self):
        a=DynamicAudience.objects.create(name="Bad",created_by=self.user)
        c=AudienceCondition(audience=a,field="gender",operator=AudienceOperator.EQUALS,value="x")
        with self.assertRaises(ValidationError): validate_condition(c)
    @override_settings(MULTI_TENANCY_ENABLED=True,TENANT_HEADER_ENABLED=True,TENANT_HEADER_NAME="X-Notification-Tenant")
    def test_non_member_cannot_resolve_tenant(self):
        class R: pass
        r=R(); r.headers={"X-Notification-Tenant":"tenant-a"}; r.user=self.other
        with self.assertRaises(PermissionDenied): resolve_request_context(r)
    @override_settings(DYNAMIC_AUDIENCES_ENABLED=False)
    def test_dynamic_audience_flag(self):
        a=DynamicAudience.objects.create(name="Disabled",created_by=self.user)
        with self.assertRaises(RuntimeError): evaluate_audience(a)
