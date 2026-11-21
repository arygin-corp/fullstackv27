from django.conf import settings
from rest_framework.permissions import BasePermission


class PeopleFrontendApplicationPermission(BasePermission):
    """Allow a signed-in caller from the configured People frontend client."""

    message = "The calling application is not authorized for the People API."

    def has_permission(self, request, view):
        if not getattr(request.user, "is_authenticated", False):
            return False

        claims = {}
        if isinstance(getattr(request, "auth", None), dict):
            claims.update(request.auth)
        if isinstance(getattr(request, "msal_claims", None), dict):
            claims.update(request.msal_claims)

        client_id = str(claims.get("azp") or claims.get("appid") or "")
        if not client_id:
            return False

        expected_client_id = getattr(settings, "PEOPLE_FRONTEND_CLIENT_ID", "")
        if expected_client_id and client_id != str(expected_client_id):
            return False
        return True
