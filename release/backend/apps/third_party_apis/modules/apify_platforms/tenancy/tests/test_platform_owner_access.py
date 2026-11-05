from django.contrib.auth import get_user_model
from django.test import TestCase
from apps.third_party_apis.modules.apify_platforms.tenancy.access import has_application_access,is_data_marketplace_platform_owner
from apps.third_party_apis.modules.apify_platforms.tenancy.models import *
class PlatformOwnerAccessTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user('owner')
        self.tenant=Tenant.objects.create(name='Platform',slug='platform')
        self.team=EnterpriseTeam.objects.create(tenant=self.tenant,name='Data Marketplace Team',slug='data-marketplace-team')
        TenantMembership.objects.create(tenant=self.tenant,user=self.user,role='platform_admin')
        TeamMembership.objects.create(team=self.team,user=self.user,role='owner')
        self.access=ApplicationAccessGroup.objects.create(name='Apify Users',slug='apify-users',purpose='app_access')
        self.owner=ApplicationAccessGroup.objects.create(name='Platform Owners',slug='owners',purpose='platform_owner')
        PlatformOwnership.objects.create(team=self.team,owner_group=self.owner)
    def test_team_owner_without_app_group_is_denied(self): self.assertFalse(is_data_marketplace_platform_owner(self.user))
    def test_app_group_alone_grants_app_but_not_platform_owner(self):
        ApplicationAccessGroupMembership.objects.create(group=self.access,user=self.user)
        self.assertTrue(has_application_access(self.user)); self.assertFalse(is_data_marketplace_platform_owner(self.user))
    def test_owner_requires_both_groups_and_team(self):
        ApplicationAccessGroupMembership.objects.create(group=self.access,user=self.user)
        ApplicationAccessGroupMembership.objects.create(group=self.owner,user=self.user)
        self.assertTrue(is_data_marketplace_platform_owner(self.user))
