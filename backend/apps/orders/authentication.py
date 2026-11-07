"""Authenticate the marketplace sign-in token for the signed-in user's own orders."""

from __future__ import annotations

import os

import jwt
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from apps.third_party_apis.modules.vikki.chat.authentication import _jwks_client


SIGNIN_TENANT_ID = os.getenv(
    "MARKETPLACE_SIGNIN_TENANT_ID",
    "b7be26fb-0007-4e34-9f39-088aa7bc74b0",
)
SIGNIN_CLIENT_ID = os.getenv(
    "MARKETPLACE_SIGNIN_CLIENT_ID",
    "e469e37c-6300-4d6b-866a-501dc2b2edfe",
)


class SignedInMarketplaceUser:
    """Minimal authenticated user. Order lookup uses the token oid, not this row."""

    is_authenticated = True
    is_active = True
    is_anonymous = False
    is_staff = False
    is_superuser = False
    pk = None

    def __init__(self, oid: str):
        self.object_id = oid
        self.username = oid


class MarketplaceSignInAuthentication(BaseAuthentication):
    """Validate the Microsoft sign-in ID token already issued to this marketplace app.

    The Data Marketplace sign-in does not grant the separate orders API scope, so
    tracking uses the signed-in ID token. The audience is this app's public client
    id and the subject is the Entra object id stored on each request.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header:
            return None
        if header[0].decode("ascii", errors="ignore").lower() != self.keyword.lower():
            return None
        if len(header) != 2:
            raise AuthenticationFailed("Invalid Authorization header.")

        token = header[1].decode("ascii", errors="strict")
        claims = self._validate(token)
        return SignedInMarketplaceUser(claims["oid"]), claims

    def authenticate_header(self, request):
        return 'Bearer realm="marketplace"'

    def _validate(self, token: str) -> dict:
        issuer = f"https://login.microsoftonline.com/{SIGNIN_TENANT_ID}/v2.0"
        jwks_url = f"https://login.microsoftonline.com/{SIGNIN_TENANT_ID}/discovery/v2.0/keys"
        try:
            signing_key = _jwks_client(jwks_url).get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=SIGNIN_CLIENT_ID,
                issuer=issuer,
                options={
                    "require": ["exp", "iat", "iss", "aud", "tid", "oid"],
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_aud": True,
                    "verify_iss": True,
                },
                leeway=60,
            )
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationFailed("Sign-in token has expired.") from exc
        except jwt.InvalidAudienceError as exc:
            raise AuthenticationFailed("Sign-in token audience is not this marketplace app.") from exc
        except jwt.InvalidIssuerError as exc:
            raise AuthenticationFailed("Sign-in token issuer is not trusted.") from exc
        except (jwt.PyJWTError, ValueError, TypeError) as exc:
            raise AuthenticationFailed("Invalid sign-in token.") from exc

        if str(claims.get("tid")) != SIGNIN_TENANT_ID:
            raise AuthenticationFailed("Sign-in token tenant is not trusted.")
        return claims
