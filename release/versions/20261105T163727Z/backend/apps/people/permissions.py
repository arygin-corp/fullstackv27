from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.external_apis.key_services import verify_api_key
from apps.external_apis.models import FrontendApplication


class PeopleFrontendApplicationPermission(BasePermission):
    """Authorize People API calls without importing gateway permissions."""

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

        try:
            application = FrontendApplication.objects.get(
                azure_client_id=client_id,
                active=True,
            )
        except FrontendApplication.DoesNotExist:
            return False

        origin = request.headers.get("Origin", "").rstrip("/")
        if origin and origin not in (application.allowed_origins or []):
            return False

        api_key = verify_api_key(request.headers.get("X-API-Key", ""))
        if api_key is None or api_key.application_id != application.pk:
            return False

        required_scopes = set(
            getattr(view, "required_external_api_scopes", ("people.read",))
        )
        if not required_scopes.issubset(set(api_key.scopes or [])):
            return False

        request.frontend_application = application
        request.external_api_key = api_key
        return True

