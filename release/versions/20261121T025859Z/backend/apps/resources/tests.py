from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone

from .models import Brand, Document, Homepage, ResourceAnalytics, ResourceChangeRequest, ResourceVersion
from .permissions import ADMIN, WEB
from .services.core import approve_change, archive_resource, create_version, increment_analytics, publish_resource, restore_resource, submit_change
from .validators import validate_image_upload, validate_resource_url

User=get_user_model()
class GovernanceTests(TestCase):
    def setUp(self):
        self.submitter=User.objects.create_user('publisher'); self.approver=User.objects.create_user('admin')
        web,_=Group.objects.get_or_create(name=WEB); admin,_=Group.objects.get_or_create(name=ADMIN)
        self.submitter.groups.add(web); self.approver.groups.add(admin)
        self.brand=Brand.objects.create(name='B',size='1',desc='d',download_url='/x',created_by=self.submitter,updated_by=self.submitter)
    def test_archive_restore(self):
        archive_resource(self.brand,self.submitter); self.brand.refresh_from_db(); self.assertTrue(self.brand.is_archived); self.assertFalse(self.brand.is_active)
        restore_resource(self.brand,self.submitter); self.brand.refresh_from_db(); self.assertFalse(self.brand.is_archived); self.assertTrue(self.brand.is_active)
    def test_self_approval_blocked_and_matrix(self):
        cr=ResourceChangeRequest.objects.create(resource_type=ContentType.objects.get_for_model(self.brand),resource_id=self.brand.pk,action='UPDATE',proposed_data={'name':'New'},submitter=self.submitter)
        submit_change(cr)
        with self.assertRaises(PermissionDenied): approve_change(cr,self.submitter)
        approve_change(cr,self.approver); self.assertEqual(cr.status,'APPROVED')
    def test_homepage_single_active(self):
        one=Homepage.objects.create(title='1',sub_title='s',desc='d',created_by=self.submitter,updated_by=self.submitter)
        two=Homepage.objects.create(title='2',sub_title='s',desc='d',created_by=self.submitter,updated_by=self.submitter)
        publish_resource(one,self.submitter); publish_resource(two,self.submitter); one.refresh_from_db(); self.assertFalse(one.is_active); self.assertTrue(two.is_active)
    def test_version_and_analytics(self):
        doc=Document.objects.create(name='D',classification='x',size='1',file_format='pdf',desc='d',view_url='/d',download_url='/d',created_by=self.submitter,updated_by=self.submitter)
        version=create_version(doc,self.submitter); self.assertEqual(version.version,'v1')
        increment_analytics(doc,'views'); row=ResourceAnalytics.objects.get(resource_id=doc.pk); self.assertEqual(row.views,1)
    def test_url_and_upload_validation(self):
        validate_resource_url('https://example.com'); validate_resource_url('/internal/path')
        with self.assertRaises(ValidationError): validate_resource_url('javascript:alert(1)')
        with self.assertRaises(ValidationError): validate_image_upload(SimpleUploadedFile('bad.exe',b'x',content_type='application/octet-stream'))
