from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from apps.marketplace.models import Classification, Datatype, Domain, Product
from apps.third_party_apis.modules.product_intake.models import NotificationOutbox, ProductIntake, UserNotification

User=get_user_model()

class WorkflowTests(TestCase):
    def setUp(self):
        self.group=Group.objects.create(name="Content Manager Group")
        self.actor=User.objects.create_user(username="reviewer",email="reviewer@example.com",password="pw")
        self.actor.groups.add(self.group)
        self.requester=User.objects.create_user(username="requester",email="requester@example.com",password="pw")
        self.domain=Domain.objects.create(sku=100,name="Domain",is_active=True)
        self.datatype=Datatype.objects.create(name="Type",value="type",is_active=True)
        self.classification=Classification.objects.create(name="Protected",value="protected",is_active=True)
        self.intake=ProductIntake.objects.create(product_name="Test Product",product_desc="Description",product_pii="No",product_spi="No",requester_first_name="Jane",requester_last_name="Doe",requester_email="requester@example.com",submitted_by_first_name="John",submitted_by_last_name="Smith",submitted_by_email="requester@example.com",marketplace_domain=self.domain,marketplace_datatype=self.datatype,marketplace_classification=self.classification,status="under_review",created_by=self.requester,updated_by=self.requester)

    def test_rejection_requires_comments_and_notifies(self):
        c=APIClient(); c.force_authenticate(self.actor)
        url=f"/api/new/product/intake/{self.intake.pk}/reject/"
        self.assertEqual(c.post(url,{"reason":"Incomplete","comments":"short"},format="json").status_code,400)
        response=c.post(url,{"reason":"Incomplete","comments":"Please provide all required metadata."},format="json")
        self.assertEqual(response.status_code,200)
        self.intake.refresh_from_db(); self.assertEqual(self.intake.status,"rejected")
        self.assertFalse(Product.objects.filter(source_intake=self.intake).exists())
        self.assertTrue(UserNotification.objects.filter(intake=self.intake,event="intake_rejected").exists())
        self.assertTrue(NotificationOutbox.objects.filter(intake=self.intake,event_type="intake_rejected").exists())

    def test_approval_does_not_create_a_product(self):
        c=APIClient(); c.force_authenticate(self.actor)
        response=c.post(f"/api/new/product/intake/{self.intake.pk}/approve/",{"reason":"Ready for product preparation."},format="json")
        self.assertEqual(response.status_code,200)
        self.intake.refresh_from_db()
        self.assertEqual(self.intake.status,"approved")
        self.assertFalse(Product.objects.filter(source_intake=self.intake).exists())

    def test_draft_then_curate_then_activate(self):
        c=APIClient(); c.force_authenticate(self.actor)
        c.post(f"/api/new/product/intake/{self.intake.pk}/approve/",{"reason":"Ready."},format="json")
        blocked=c.post(f"/api/new/product/intake/{self.intake.pk}/activate-product/",{"reason":"Too early."},format="json")
        self.assertEqual(blocked.status_code,400)
        drafted=c.post(f"/api/new/product/intake/{self.intake.pk}/create-draft-product/",{"reason":"Add as draft."},format="json")
        self.assertEqual(drafted.status_code,200)
        self.intake.refresh_from_db(); product=self.intake.marketplace_product
        self.assertEqual(self.intake.status,"product_draft")
        self.assertEqual(product.status,"draft"); self.assertFalse(product.is_active)
        still_blocked=c.post(f"/api/new/product/intake/{self.intake.pk}/activate-product/",{"reason":"Still too early."},format="json")
        self.assertEqual(still_blocked.status_code,400)
        curated=c.post(f"/api/new/product/intake/{self.intake.pk}/curate-product/",{"reason":"Catalog content is ready to publish."},format="json")
        self.assertEqual(curated.status_code,200)
        self.intake.refresh_from_db(); product.refresh_from_db()
        self.assertEqual(self.intake.status,"curated")
        self.assertEqual(product.status,"draft"); self.assertFalse(product.is_active)
        response=c.post(f"/api/new/product/intake/{self.intake.pk}/activate-product/",{"reason":"Publish on Data Marketplace."},format="json")
        self.assertEqual(response.status_code,200)
        self.intake.refresh_from_db(); product.refresh_from_db()
        self.assertEqual(self.intake.status,"archived"); self.assertFalse(self.intake.is_active); self.assertEqual(product.status,"approved"); self.assertTrue(product.is_active)
        self.assertTrue(UserNotification.objects.filter(intake=self.intake,event="product_available").exists())
