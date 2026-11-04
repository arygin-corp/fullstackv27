import hashlib
import json
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from .exceptions import GatewayIdempotencyConflict, GatewayRateLimitError
from .models import IdempotencyRecord

def _bucket_key(endpoint, application, period, marker): return f"gateway:{period}:{endpoint.pk}:{application.pk}:{marker}"

def enforce_rate_limit(endpoint, application, now=None):
    now = now or timezone.now(); minute = now.strftime("%Y%m%d%H%M"); day = now.strftime("%Y%m%d")
    minute_count = 0
    for period, key, limit, ttl in (("minute", _bucket_key(endpoint, application, "minute", minute), endpoint.requests_per_minute, 75), ("day", _bucket_key(endpoint, application, "day", day), endpoint.requests_per_day, 90000)):
        if cache.add(key, 1, ttl): count = 1
        else:
            try: count = cache.incr(key)
            except ValueError: cache.set(key, 1, ttl); count = 1
        if period == "minute": minute_count = count
        if count > limit: raise GatewayRateLimitError(f"The published endpoint {period} quota was exceeded.")
    return max(0, endpoint.requests_per_minute - minute_count)

def request_digest(method, path, query, body):
    canonical = json.dumps({"method": method, "path": path, "query": query, "body": body}, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()

def idempotency_digest(key): return hashlib.sha256(key.encode()).hexdigest()

@transaction.atomic
def get_or_create_idempotency(endpoint, application, plaintext_key, request_hash, expires_at):
    key_hash = idempotency_digest(plaintext_key)
    record, created = IdempotencyRecord.objects.select_for_update().get_or_create(endpoint=endpoint, application=application, key_hash=key_hash, defaults={"request_hash": request_hash, "expires_at": expires_at})
    if not created and record.request_hash != request_hash: raise GatewayIdempotencyConflict("The idempotency key was already used for a different request.")
    if not created and record.response_status is None: raise GatewayIdempotencyConflict("The idempotent request is already in progress.")
    return record, created
