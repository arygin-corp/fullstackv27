from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from notifications.models import AudienceType, CampaignStatus, NotificationCampaign, NotificationTemplate, NotificationTemplateVersion
from notifications.services.campaigns import CampaignService
from notifications.services.templates import activate_version, render_template, validate_template_version

class Phase5Tests(TestCase):
    def setUp(self):
        U=get_user_model(); self.author=U.objects.create_user("author",password="x",is_staff=True); self.approver=U.objects.create_user("approver",password="x",is_staff=True); self.user=U.objects.create_user("target",password="x")
        self.template=NotificationTemplate.objects.create(key="welcome",name="Welcome",allowed_variables=["username","campaign_name","variant"],created_by=self.author)
        self.version=NotificationTemplateVersion.objects.create(template=self.template,version=1,locale="en-US",subject_template="Hello {{ username }}",body_template="Welcome to {{ campaign_name }}",url_template="",created_by=self.author)
        activate_version(self.version)
    def test_template_validation_and_render(self):
        rendered=render_template(self.version,{"username":"Giovanni","campaign_name":"Platform","ignored":"secret"})
        self.assertEqual(rendered["title"],"Hello Giovanni"); self.assertEqual(rendered["body"],"Welcome to Platform")
    def test_template_rejects_unknown_variable_and_tags(self):
        bad=NotificationTemplateVersion(template=self.template,version=2,subject_template="{{ secret }}",body_template="{% if username %}x{% endif %}")
        with self.assertRaises(ValidationError): validate_template_version(bad)
    def test_two_person_approval(self):
        c=NotificationCampaign.objects.create(name="C",template_version=self.version,audience_type=AudienceType.USERS,created_by=self.author)
        CampaignService.request_approval(c)
        with self.assertRaises(ValueError): CampaignService.approve(c,self.author)
        CampaignService.approve(c,self.approver); self.assertEqual(c.status,CampaignStatus.APPROVED)
    @patch("notifications.services.notifications.NotificationService.dispatch_outbox")
    def test_campaign_send_materializes_and_is_idempotent(self, dispatch):
        c=NotificationCampaign.objects.create(name="C",template_version=self.version,audience_type=AudienceType.USERS,context={"campaign_name":"Platform"},created_by=self.author,status=CampaignStatus.APPROVED,approved_by=self.approver,approved_at=timezone.now())
        c.audience_users.add(self.user)
        self.assertEqual(CampaignService.send(c),1); c.refresh_from_db(); self.assertEqual(c.status,CampaignStatus.SENT); self.assertEqual(c.recipients.count(),1); self.assertIsNotNone(c.recipients.get().notification)
        with self.assertRaises(ValueError): CampaignService.send(c)
    def test_staff_pages_require_staff(self):
        self.client.force_login(self.user); self.assertEqual(self.client.get('/notifications/templates/').status_code,302)
        self.client.force_login(self.author); self.assertEqual(self.client.get('/notifications/templates/').status_code,200); self.assertEqual(self.client.get('/notifications/campaigns/').status_code,200)
