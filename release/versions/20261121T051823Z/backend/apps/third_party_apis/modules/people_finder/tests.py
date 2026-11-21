from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from .permissions import PeopleFrontendApplicationPermission
from .services import (
    DEFAULT_SELECT,
    InvalidPeopleCursor,
    list_people,
    search_people,
)


class PeopleServiceTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.request = self.factory.get("/people/users/")
        self.request.correlation_id = "00000000-0000-0000-0000-000000000001"

    @patch("apps.people.services.search_users")
    def test_people_list_builds_expected_graph_query(self, search_users):
        search_users.return_value = {
            "value": [{"id": "1", "displayName": "Ada Lovelace"}],
            "@odata.count": 1,
        }

        page = list_people(
            self.request,
            page_size=25,
            filters={"department": "Data Governance"},
            sort_by="surname",
            sort_dir="desc",
        )

        self.assertEqual(page["total_count"], 1)
        search_users.assert_called_once_with(
            self.request,
            {
                "filter": {"department": "Data Governance"},
                "select": DEFAULT_SELECT,
                "sort": ["surname desc"],
                "top": 25,
            },
        )

    @patch("apps.people.services.search_users")
    def test_lookup_searches_name_mail_and_upn(self, search_users):
        search_users.return_value = {"value": []}
        search_people(self.request, "Ada", page_size=10)
        query = search_users.call_args.args[1]
        self.assertEqual(
            query["search"],
            {
                "displayName": "Ada",
                "mail": "Ada",
                "userPrincipalName": "Ada",
            },
        )

    @patch("apps.people.services.next_users")
    def test_invalid_cursor_is_a_client_error(self, next_users):
        next_users.side_effect = ValueError(
            "nextLink is not an approved Microsoft Graph users URL."
        )
        with self.assertRaises(InvalidPeopleCursor):
            list_people(
                self.request,
                cursor="https://evil.example.com/users",
            )


@override_settings(PEOPLE_FRONTEND_CLIENT_ID="people-client-id")
class PeoplePermissionTests(TestCase):
    def test_wrong_frontend_client_is_rejected(self):
        request = APIRequestFactory().get(
            "/people/users/", HTTP_ORIGIN="https://people.example"
        )
        user = get_user_model().objects.create_user(username="tester")
        force_authenticate(request, user=user, token={"azp": "other-client-id"})
        request.user = user
        request.auth = {"azp": "other-client-id"}
        request.correlation_id = "00000000-0000-0000-0000-000000000001"
        self.assertFalse(
            PeopleFrontendApplicationPermission().has_permission(request, None)
        )
