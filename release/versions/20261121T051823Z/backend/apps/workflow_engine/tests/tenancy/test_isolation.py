from django.contrib.auth import get_user_model
from django.test import TestCase
from workflow_engine.authorization import WorkflowAuthorization
from workflow_engine.platform_models import Tenant,TenantMembership
class TenantIsolationTests(TestCase):
 def test_non_member_gets_empty_queryset(self):
  tenant=Tenant.objects.create(name='T',key='t');user=get_user_model().objects.create_user(username='u');self.assertFalse(WorkflowAuthorization._tenant_member(user,tenant));self.assertFalse(WorkflowAuthorization.filter_instances(user=user,tenant=tenant).exists())
