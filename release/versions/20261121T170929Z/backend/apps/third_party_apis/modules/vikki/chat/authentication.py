from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header


@dataclass(frozen=True)
class EntraTokenClaims:
    oid: str
    tid: str
    username: str
    email: str
    name: str
    scopes: frozenset[str]
    roles: frozenset[str]
    raw: dict[str, Any]


@lru_cache(maxsize=4)
def _jwks_client(jwks_url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(
        jwks_url,
        cache_keys=True,
        lifespan=3600,
    )


def _split_claim(value: Any) -> frozenset[str]:
    if isinstance(value, str):
        return frozenset(item for item in value.split() if item)
    if isinstance(value, list):
        return frozenset(str(item) for item in value if item)
    return frozenset()


class EntraAccessTokenAuthentication(BaseAuthentication):
    """Validate a Microsoft Entra v2 access token issued for this Django API.

    The authenticated frontend identity is mapped to a local non-staff Django user.
    This local row supports existing Conversation.user and ownership foreign keys; it
    does not grant Django Admin access.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        header = get_authorization_header(request).split()

        if not header:
            return None

        if header[0].decode("ascii", errors="ignore").lower() != "bearer":
            return None

        if len(header) != 2:
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        token = header[1].decode("ascii", errors="strict")
        claims = self._validate_token(token)
        self._authorize_claims(claims)
        user = self._get_or_create_user(claims)
        return user, claims.raw

    def authenticate_header(self, request):
        return 'Bearer realm="api"'

    def _validate_token(self, token: str) -> EntraTokenClaims:
        tenant_id = settings.ENTRA_API_TENANT_ID
        audience = settings.ENTRA_API_AUDIENCE
        issuer = f"https://login.microsoftonline.com/{tenant_id}/v2.0"
        jwks_url = f"https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys"

        try:
            signing_key = _jwks_client(jwks_url).get_signing_key_from_jwt(token)
            raw = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=audience,
                issuer=issuer,
                options={
                    "require": ["exp", "iat", "iss", "aud", "tid", "oid"],
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_aud": True,
                    "verify_iss": True,
                },
                leeway=getattr(settings, "ENTRA_API_CLOCK_SKEW_SECONDS", 60),
            )
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Microsoft Entra access token has expired.") from exc
        except jwt.InvalidAudienceError as exc:
            raise exceptions.AuthenticationFailed("Access token audience is not this API.") from exc
        except jwt.InvalidIssuerError as exc:
            raise exceptions.AuthenticationFailed("Access token issuer is not trusted.") from exc
        except (jwt.PyJWTError, ValueError, TypeError) as exc:
            raise exceptions.AuthenticationFailed("Invalid Microsoft Entra access token.") from exc

        username = str(
            raw.get("preferred_username")
            or raw.get("upn")
            or raw.get("email")
            or raw["oid"]
        ).strip()
        email = str(raw.get("email") or raw.get("preferred_username") or "").strip()

        return EntraTokenClaims(
            oid=str(raw["oid"]),
            tid=str(raw["tid"]),
            username=username,
            email=email,
            name=str(raw.get("name") or username),
            scopes=_split_claim(raw.get("scp")),
            roles=_split_claim(raw.get("roles")),
            raw=raw,
        )

    def _authorize_claims(self, claims: EntraTokenClaims) -> None:
        if claims.tid != settings.ENTRA_API_TENANT_ID:
            raise exceptions.AuthenticationFailed("Access token tenant is not trusted.")

        required_scope = getattr(settings, "ENTRA_API_REQUIRED_SCOPE", "access_as_user")
        allowed_roles = frozenset(getattr(settings, "ENTRA_API_ALLOWED_ROLES", []))

        delegated_allowed = required_scope in claims.scopes
        application_allowed = bool(allowed_roles.intersection(claims.roles))

        if not delegated_allowed and not application_allowed:
            audience = claims.raw.get("aud")
            audiences = audience if isinstance(audience, list) else [audience]
            signed_in_id_token = (
                not claims.raw.get("scp")
                and settings.ENTRA_API_CLIENT_ID in audiences
            )
            if signed_in_id_token:
                return
            raise exceptions.PermissionDenied(
                f"The access token requires scope '{required_scope}'"
                + (" or an allowed app role." if allowed_roles else ".")
            )

    def _get_or_create_user(self, claims: EntraTokenClaims):
        User = get_user_model()

        # Use tenant + immutable object ID rather than an email address as the key.
        stable_username = f"entra:{claims.tid}:{claims.oid}"

        user, created = User.objects.get_or_create(
            username=stable_username,
            defaults={
                "email": claims.email,
                "first_name": claims.name[:150],
                "is_active": True,
                "is_staff": False,
                "is_superuser": False,
            },
        )

        updates = []
        if claims.email and user.email != claims.email:
            user.email = claims.email
            updates.append("email")
        if claims.name and user.first_name != claims.name[:150]:
            user.first_name = claims.name[:150]
            updates.append("first_name")

        # A frontend token can never elevate a shadow user into Django Admin.
        if user.is_staff:
            user.is_staff = False
            updates.append("is_staff")
        if user.is_superuser:
            user.is_superuser = False
            updates.append("is_superuser")

        if created:
            user.set_unusable_password()
            updates.append("password")

        if updates:
            user.save(update_fields=list(dict.fromkeys(updates)))

        return user
