from django.utils import timezone
from rest_framework.permissions import BasePermission
from .key_services import verify_api_key
from .models import EndpointGrant, FrontendApplication, PublishedEndpoint

class PublishedEndpointPermission(BasePermission):
    message = "The application, key, scope, or endpoint grant is invalid."
    def has_permission(self, request, view):
        endpoint = getattr(request, "published_endpoint", None)
        if endpoint is None: return False
        mode = endpoint.authentication_mode; application = None
        if mode in (PublishedEndpoint.AuthenticationMode.ENTRA, PublishedEndpoint.AuthenticationMode.ENTRA_AND_API_KEY):
            if not getattr(request.user, "is_authenticated", False): return False
            claims = {}
            if isinstance(getattr(request, "auth", None), dict): claims.update(request.auth)
            if isinstance(getattr(request, "msal_claims", None), dict): claims.update(request.msal_claims)
            client_id = claims.get("azp") or claims.get("appid")
            try: application = FrontendApplication.objects.get(azure_client_id=client_id, active=True)
            except FrontendApplication.DoesNotExist: return False
            origin = request.headers.get("Origin", "").rstrip("/")
            if origin and origin not in (application.allowed_origins or []): return False
        if mode in (PublishedEndpoint.AuthenticationMode.API_KEY, PublishedEndpoint.AuthenticationMode.ENTRA_AND_API_KEY):
            key = verify_api_key(request.headers.get("X-API-Key", ""), request.META.get("REMOTE_ADDR"))
            if not key or (application and application.pk != key.application_id): return False
            application = key.application; request.external_api_key = key
        if application is None: return False
        request.frontend_application = application
        try: grant = EndpointGrant.objects.get(application=application, endpoint=endpoint, active=True)
        except EndpointGrant.DoesNotExist: return False
        if grant.expires_at and grant.expires_at <= timezone.now(): return False
        allowed = set(grant.scopes or []); key = getattr(request, "external_api_key", None)
        if key: allowed &= set(key.scopes or [])
        return set(endpoint.required_scopes or []).issubset(allowed)
