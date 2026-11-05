import hashlib
import hmac
import ipaddress
import secrets
from dataclasses import dataclass
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from .models import APIKey

@dataclass(frozen=True)
class GeneratedAPIKey:
    record: APIKey
    plaintext: str

def digest_api_key(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()

@transaction.atomic
def generate_api_key(*, application, name, created_by, scopes, lifetime_days=90, allowed_cidrs=None, rotated_from=None):
    if not 1 <= lifetime_days <= 365:
        raise ValueError("lifetime_days must be between 1 and 365")
    prefix = secrets.token_hex(6)
    plaintext = f"ext_{prefix}_{secrets.token_urlsafe(32)}"
    now = timezone.now()
    record = APIKey.objects.create(application=application, name=name, prefix=prefix, secret_hash=digest_api_key(plaintext), scopes=sorted(set(scopes or [])), allowed_cidrs=allowed_cidrs or [], created_by=created_by, activates_at=now, expires_at=now + timedelta(days=lifetime_days), rotated_from=rotated_from)
    return GeneratedAPIKey(record=record, plaintext=plaintext)

def verify_api_key(plaintext, client_ip=None):
    try:
        marker, prefix, _secret = plaintext.split("_", 2)
    except (AttributeError, ValueError):
        return None
    if marker != "ext":
        return None
    try:
        record = APIKey.objects.select_related("application").get(prefix=prefix)
    except APIKey.DoesNotExist:
        return None
    if not record.is_usable or not hmac.compare_digest(record.secret_hash, digest_api_key(plaintext)):
        return None
    if record.allowed_cidrs and client_ip:
        address = ipaddress.ip_address(client_ip)
        if not any(address in ipaddress.ip_network(cidr, strict=False) for cidr in record.allowed_cidrs):
            return None
    APIKey.objects.filter(pk=record.pk).update(last_used_at=timezone.now(), last_used_ip=client_ip)
    return record

@transaction.atomic
def revoke_api_key(record, *, revoked_by, reason):
    if not reason.strip():
        raise ValueError("A revocation reason is required.")
    record.revoked_at = timezone.now(); record.revoked_by = revoked_by; record.revocation_reason = reason
    record.save(update_fields=("revoked_at", "revoked_by", "revocation_reason"))
    return record
