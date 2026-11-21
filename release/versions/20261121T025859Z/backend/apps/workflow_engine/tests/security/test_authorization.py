from datetime import timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.utils import timezone
from workflow_engine.authorization import WorkflowAuthorization
from workflow_engine.models import WorkflowDefinition,WorkflowInstance,WorkflowState
from workflow_engine.platform_models import Tenant,TenantMembership
from workflow_engine.security_models import DedicatedStaffAssignment,WorkflowAccessPolicy
class AuthorizationTests(TestCase):
 def setUp(self):
  U=get_user_model();self.user=U.objects.create_user(username='staff');self.other=U.objects.create_user(username='other');self.tenant=Tenant.objects.create(name='T',key='t');TenantMembership.objects.create(tenant=self.tenant,user=self.user);TenantMembership.objects.create(tenant=self.tenant,user=self.other)
  self.group=Group.objects.create(name='Governance Approvers');self.user.groups.add(self.group);self.workflow=WorkflowDefinition.objects.create(tenant=self.tenant,name='W',key='w');self.state=WorkflowState.objects.create(tenant=self.tenant,workflow=self.workflow,name='Start',key='start',is_initial=True);self.instance=WorkflowInstance.objects.create(tenant=self.tenant,workflow=self.workflow,current_state=self.state)
  policy=WorkflowAccessPolicy.objects.create(tenant=self.tenant,workflow=self.workflow,action='transition',requires_dedicated_staff=True,role='approver');policy.groups.add(self.group)
  DedicatedStaffAssignment.objects.create(tenant=self.tenant,user=self.user,group=self.group,workflow=self.workflow,role='approver',starts_at=timezone.now()-timedelta(days=1))
 def test_requires_both_staffing_and_group(self):self.assertTrue(WorkflowAuthorization.allowed(user=self.user,tenant=self.tenant,action='transition',workflow=self.workflow,instance=self.instance,state=self.state,role='approver'))
 def test_member_without_group_is_denied(self):self.assertFalse(WorkflowAuthorization.allowed(user=self.other,tenant=self.tenant,action='transition',workflow=self.workflow,instance=self.instance,state=self.state,role='approver'))
 def test_expired_staffing_is_denied(self):
  a=self.user.dedicated_workflow_staffing.get();a.ends_at=timezone.now()-timedelta(seconds=1);a.save();self.assertFalse(WorkflowAuthorization.allowed(user=self.user,tenant=self.tenant,action='transition',workflow=self.workflow,instance=self.instance,state=self.state,role='approver'))
