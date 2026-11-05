from django.contrib.auth import get_user_model
from django.test import TestCase
from .models import Page,Approval
class PagesTests(TestCase):
 def test_retention(self):
  u=get_user_model().objects.create(username='u'); p=Page.objects.create(title='T',slug='t',page_type=Page.Type.PRODUCT); p.soft_delete(u); self.assertEqual((p.purge_at-p.deleted_at).days,7)
 def test_comment_validation(self):
  a=Approval(decision=Approval.Decision.APPROVED,comment='short')
  with self.assertRaises(Exception): a.clean()
