from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass

@dataclass(frozen=True)
class AuditRequestContext:
    actor: object = None
    source: str = 'system'
    request_id: str = ''
    request_method: str = ''
    request_path: str = ''
    change_reason: str = ''
_current = ContextVar('forms_audit_context', default=None)

def get_audit_context():
    return _current.get()

@contextmanager
def audit_context(**kwargs):
    token = _current.set(AuditRequestContext(**kwargs))
    try:
        yield
    finally:
        _current.reset(token)
