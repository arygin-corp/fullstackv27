from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
class ViewTests(TestCase):
    def setUp(self):self.user=get_user_model().objects.create_user(username="aws-user",password="x");self.client.force_login(self.user)
    def test_list(self):self.assertEqual(self.client.get(reverse("third_party_apis_aws:index")).status_code,200)
    def test_parity(self):self.assertEqual(self.client.get(reverse("third_party_apis_aws:parity")).status_code,200)
