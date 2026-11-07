import msal
from django.conf import settings


def build_msal_app():
    return msal.ConfidentialClientApplication(
        client_id=settings.MSAL_CLIENT_ID,
        authority=settings.MSAL_AUTHORITY,
        client_credential=settings.MSAL_CLIENT_CREDENTIAL,
    )


def requested_scopes():
    # OIDC scopes are sufficient for sign-in. Add API scopes only when needed.
    return list(getattr(settings, "MSAL_SCOPES", []))
