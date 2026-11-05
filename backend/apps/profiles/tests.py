from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase

from apps.profiles.middleware import VerifiedStaffAccessMiddleware, user_is_verified_staff


class _Profile:
    def __init__(self, is_verified):
        self.is_verified = is_verified


class _User:
    def __init__(self, *, staff=False, superuser=False, verified=False, missing_profile=False):
        self.is_authenticated = True
        self.is_staff = staff
        self.is_superuser = superuser
        self._profile = None if missing_profile else _Profile(verified)

    @property
    def profile(self):
        if self._profile is None:
            raise ObjectDoesNotExist
        return self._profile


class VerifiedStaffAccessTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = VerifiedStaffAccessMiddleware(lambda request: HttpResponse("ok"))

    def _response(self, user, path="/sa/modules/"):
        request = self.factory.get(path)
        request.user = user
        return self.middleware(request)

    def test_anonymous_user_is_not_redirected(self):
        response = self._response(AnonymousUser())
        self.assertEqual(response.status_code, 200)

    def test_verified_staff_continues(self):
        self.assertTrue(user_is_verified_staff(_User(staff=True, verified=True)))
        self.assertEqual(self._response(_User(staff=True, verified=True)).status_code, 200)

    def test_unverified_staff_is_redirected(self):
        response = self._response(_User(staff=True, verified=False))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/not-authorized/")

    def test_not_authorized_page_stays_available(self):
        response = self._response(_User(staff=True, verified=False), "/not-authorized/")
        self.assertEqual(response.status_code, 200)

    def test_superuser_and_non_staff_are_not_sent_to_the_page(self):
        self.assertEqual(self._response(_User(staff=True, superuser=True, verified=False)).status_code, 200)
        self.assertEqual(self._response(_User(staff=False, verified=False)).status_code, 200)
