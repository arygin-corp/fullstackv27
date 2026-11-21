import hashlib, hmac, json
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from apps.notifications.models import AuditLedgerCheckpoint, AuditLedgerEntry, AuditLedgerVerification, LedgerVerificationStatus
from apps.notifications.monitoring.metrics import inc
GENESIS_HASH = "0" * 64
SENSITIVE_KEYS = {"token","password","authorization","api_key","webhook_url","body","content"}
def canonical_json(value): return json.dumps(value,sort_keys=True,separators=(",",":"),default=str,ensure_ascii=True)
def sanitize(value):
    if isinstance(value,dict): return {k:sanitize(v) for k,v in value.items() if k.lower() not in SENSITIVE_KEYS}
    if isinstance(value,list): return [sanitize(v) for v in value]
    return value
def payload_digest(payload): return hashlib.sha256(canonical_json(sanitize(payload or {})).encode()).hexdigest()
def calculate_entry_hash(*,sequence,previous_hash,event_type,aggregate_type,aggregate_id,actor_reference,tenant_reference,application_reference,correlation_id,payload_digest_value,occurred_at):
    canonical=canonical_json({"sequence":sequence,"previous_hash":previous_hash,"event_type":event_type,"aggregate_type":aggregate_type,"aggregate_id":str(aggregate_id),"actor_reference":actor_reference or "","tenant_reference":tenant_reference or "","application_reference":application_reference or "","correlation_id":str(correlation_id),"payload_digest":payload_digest_value,"occurred_at":occurred_at.isoformat()})
    return hashlib.sha256(canonical.encode()).hexdigest()
def append_ledger_entry(*,event_type,aggregate_type,aggregate_id,correlation_id,payload=None,actor=None,tenant=None,application=None,occurred_at=None):
    if not settings.IMMUTABLE_AUDIT_LEDGER_ENABLED: return None
    occurred_at=occurred_at or timezone.now()
    latest=AuditLedgerEntry.objects.select_for_update().order_by("-sequence").first(); sequence=(latest.sequence if latest else 0)+1; previous=latest.entry_hash if latest else GENESIS_HASH
    digest=payload_digest(payload); actor_ref=str(actor.pk) if actor else ""; tenant_ref=str(getattr(tenant,"pk",tenant) or ""); app_ref=str(getattr(application,"pk",application) or "")
    entry_hash=calculate_entry_hash(sequence=sequence,previous_hash=previous,event_type=event_type,aggregate_type=aggregate_type,aggregate_id=aggregate_id,actor_reference=actor_ref,tenant_reference=tenant_ref,application_reference=app_ref,correlation_id=correlation_id,payload_digest_value=digest,occurred_at=occurred_at)
    entry=AuditLedgerEntry.objects.create(sequence=sequence,previous_hash=previous,entry_hash=entry_hash,event_type=event_type,aggregate_type=aggregate_type,aggregate_id=str(aggregate_id),actor_reference=actor_ref,tenant_reference=tenant_ref,application_reference=app_ref,correlation_id=correlation_id,payload_digest=digest,occurred_at=occurred_at)
    inc("notification_ledger_entries_total"); return entry
def verify_ledger():
    started=timezone.now(); previous=GENESIS_HASH; checked=0; invalid=None; expected=""; actual=""
    for entry in AuditLedgerEntry.objects.order_by("sequence").iterator():
        checked+=1
        calculated=calculate_entry_hash(sequence=entry.sequence,previous_hash=previous,event_type=entry.event_type,aggregate_type=entry.aggregate_type,aggregate_id=entry.aggregate_id,actor_reference=entry.actor_reference,tenant_reference=entry.tenant_reference,application_reference=entry.application_reference,correlation_id=entry.correlation_id,payload_digest_value=entry.payload_digest,occurred_at=entry.occurred_at)
        if entry.previous_hash!=previous or entry.entry_hash!=calculated: invalid=entry.sequence; expected=calculated; actual=entry.entry_hash; break
        previous=entry.entry_hash
    status=LedgerVerificationStatus.FAILED if invalid else LedgerVerificationStatus.PASSED
    record=AuditLedgerVerification.objects.create(status=status,checked_entries=checked,first_invalid_sequence=invalid,expected_hash=expected,actual_hash=actual,started_at=started,completed_at=timezone.now())
    inc("notification_ledger_verification_failures_total" if invalid else "notification_ledger_verification_success_total"); return record
def create_checkpoint():
    latest=AuditLedgerEntry.objects.order_by("-sequence").first()
    if not latest: return None
    signature=hmac.new(settings.AUDIT_LEDGER_SIGNING_KEY.encode(),f"{latest.sequence}:{latest.entry_hash}".encode(),hashlib.sha256).hexdigest()
    return AuditLedgerCheckpoint.objects.update_or_create(sequence=latest.sequence,defaults={"entry_hash":latest.entry_hash,"signature":signature})[0]
