from django.core.management.base import BaseCommand
from django.db import transaction
from apps.third_party_apis.modules.apify_platforms.tenancy.models import Tenant,EnterpriseTeam,ApplicationAccessGroup,PlatformOwnership
class Command(BaseCommand):
    help='Create the Data Marketplace platform-owner team and required access groups.'
    def add_arguments(self,parser):
        parser.add_argument('--tenant-slug',default='platform')
        parser.add_argument('--access-group-object-id',default='')
        parser.add_argument('--owner-group-object-id',default='')
    @transaction.atomic
    def handle(self,*args,**o):
        tenant,_=Tenant.objects.get_or_create(slug=o['tenant_slug'],defaults={'name':'Platform'})
        team,_=EnterpriseTeam.objects.get_or_create(tenant=tenant,slug='data-marketplace-team',defaults={'name':'Data Marketplace Team','description':'Apify platform owner'})
        access,_=ApplicationAccessGroup.objects.get_or_create(slug='apify-application-users',defaults={'name':'Apify Application Users','purpose':'app_access','external_object_id':o['access_group_object_id'] or None})
        owner,_=ApplicationAccessGroup.objects.get_or_create(slug='data-marketplace-platform-owners',defaults={'name':'Data Marketplace Platform Owners','purpose':'platform_owner','external_object_id':o['owner_group_object_id'] or None})
        PlatformOwnership.objects.update_or_create(team=team,defaults={'owner_group':owner,'is_active':True})
        self.stdout.write(self.style.SUCCESS('Configured Data Marketplace Team ownership and application access groups.'))
