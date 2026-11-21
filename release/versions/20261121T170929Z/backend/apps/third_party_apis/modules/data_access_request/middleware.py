import re, uuid
from .audit_context import audit_context
SAFE = re.compile('^[A-Za-z0-9._:-]{1,100}$')

class FormAuditContextMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, r):
        supplied = r.headers.get('X-Request-ID', '')
        rid = supplied if SAFE.fullmatch(supplied) else str(uuid.uuid4())
        actor = r.user if getattr(r.user, 'is_authenticated', False) else None
        with audit_context(actor=actor, source='admin' if r.path.startswith('/admin/') else 'api', request_id=rid, request_method=r.method[:10], request_path=r.path[:500], change_reason=r.headers.get('X-Change-Reason', '')[:1000]):
            response = self.get_response(r)
        response.setdefault('X-Request-ID', rid)
        return response
