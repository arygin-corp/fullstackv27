import uuid
from .services import record_event
class AuditRequestMiddleware:
 def __init__(self,get_response): self.get_response=get_response
 def __call__(self,request):
  request.request_id=request.headers.get('X-Request-ID',str(uuid.uuid4())); request.correlation_id=request.headers.get('X-Correlation-ID',request.request_id)
  try:
   response=self.get_response(request); request.audit_status_code=response.status_code
   if request.user.is_authenticated and request.method in {'POST','PUT','PATCH','DELETE'}: record_event(event_type='http.request',actor=request.user,tenant=getattr(request,'tenant',None),category='http',action=request.method,outcome='success' if response.status_code<400 else 'failure',request=request)
   response['X-Request-ID']=request.request_id; response['X-Correlation-ID']=request.correlation_id; return response
  except Exception as e:
   if getattr(request,'user',None) and request.user.is_authenticated: record_event(event_type='http.exception',actor=request.user,tenant=getattr(request,'tenant',None),category='http',outcome='failure',severity='error',request=request,error_code=e.__class__.__name__,error_message=str(e))
   raise
