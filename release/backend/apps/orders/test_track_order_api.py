from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MarketplaceOrder, Request, Task


class TrackOrderAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="order-history-user",
            password="not-used-by-api-test",
        )
        self.user_oid = "11111111-1111-1111-1111-111111111111"
        self.other_user_oid = "22222222-2222-2222-2222-222222222222"
        self.url = reverse("orders:track-order")

        self.order = MarketplaceOrder.objects.create(
            marketplace_order_id="GDX-ORD-10001"
        )
        self.request_record = Request.objects.create(
            marketplace_order=self.order,
            number="REQ000145",
            ritm_id="a3f8d2c51bcab610fa1234567890abcd",
            ritm_number="RITM000145",
            object_id=self.user_oid,
            product_id="1234",
            approval_stage="Requested",
            ritm_state="Open",
            stage="Waiting for Approval",
            opened_at=timezone.now(),
        )
        Task.objects.create(
            request=self.request_record,
            number="SCTASK000001",
            state="Open",
            assignment_group="Data Governance",
            assignment_group_manager="Order Operations Manager",
            assigned_to="Order Operations Analyst",
            created=timezone.now(),
            due=timezone.now() + timedelta(days=1),
        )

        other_order = MarketplaceOrder.objects.create(
            marketplace_order_id="GDX-ORD-20001"
        )
        Request.objects.create(
            marketplace_order=other_order,
            number="REQ999999",
            ritm_id="other-user-ritm-id",
            ritm_number="RITM999999",
            object_id=self.other_user_oid,
            product_id="9999",
            approval_stage="Approved",
            ritm_state="Open",
            stage="Work In Progress",
            opened_at=timezone.now(),
        )

    def authenticate(self, oid=None):
        self.client.force_authenticate(
            user=self.user,
            token={"oid": oid or self.user_oid},
        )

    def test_track_order_by_request_number(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            {"request_number": "REQ000145"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["marketplace_order_id"], "GDX-ORD-10001")
        self.assertEqual(response.data["requests"][0]["request_number"], "REQ000145")
        self.assertEqual(response.data["requests"][0]["ritm_number"], "RITM000145")
        self.assertEqual(
            response.data["requests"][0]["tasks"][0]["task_number"],
            "SCTASK000001",
        )

    def test_track_order_by_ritm_number(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            {"ritm_number": "RITM000145"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["marketplace_order_id"], "GDX-ORD-10001")
        self.assertEqual(
            response.data["requests"][0]["ritm_id"],
            "a3f8d2c51bcab610fa1234567890abcd",
        )
        self.assertEqual(len(response.data["requests"][0]["tasks"]), 1)

    def test_invalid_input_requires_exactly_one_identifier(self):
        self.authenticate()

        no_identifier = self.client.get(self.url)
        both_identifiers = self.client.get(
            self.url,
            {
                "request_number": "REQ000145",
                "ritm_number": "RITM000145",
            },
        )

        self.assertEqual(no_identifier.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(both_identifiers.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            no_identifier.data["detail"],
            "Provide exactly one of request_number or ritm_number.",
        )

    def test_user_cannot_track_another_users_order(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            {"request_number": "REQ999999"},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Order not found.")

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.get(
            self.url,
            {"request_number": "REQ000145"},
        )

        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )
