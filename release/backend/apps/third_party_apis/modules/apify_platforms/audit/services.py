import hashlib,json
from django.db import transaction
from .models import AuditEvent
SENSITIVE={'secret','client_secret','password','token','authorization','api_key','refresh_token','access_token'}
def redact(v):
 if isinstance(v,dict): return {k:('[REDACTED]' if k.lower() in SENSITIVE else redact(x)) for k,x in v.items()}
 if isinstance(v,list): return [redact(x) for x in v]
 return v
@transaction.atomic
def record_event(*,event_type,actor=None,tenant=None,team=None,obj=None,category='application',action='',outcome='success',severity='info',before=None,after=None,metadata=None,request=None,error_code='',error_message='',idempotency_key=''):
 tenant=tenant or getattr(obj,'tenant',None) or getattr(request,'tenant',None); previous=AuditEvent.objects.filter(tenant=tenant).order_by('-occurred_at').first(); payload={'event_type':event_type,'tenant':str(getattr(tenant,'pk','')),'actor':str(getattr(actor,'pk','')),'object_id':str(getattr(obj,'pk','')),'previous_hash':getattr(previous,'event_hash','') or ''}; digest=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()
 return AuditEvent.objects.create(tenant=tenant,team=team,actor=actor,actor_identifier=getattr(actor,'get_username',lambda:'' )(),event_type=event_type,category=category,action=action,outcome=outcome,severity=severity,object_type=getattr(getattr(obj,'_meta',None),'label',''),object_id=str(getattr(obj,'pk','')),correlation_id=getattr(request,'correlation_id','') if request else '',request_id=getattr(request,'request_id','') if request else '',idempotency_key=idempotency_key,source_ip=request.META.get('REMOTE_ADDR') if request else None,user_agent=request.META.get('HTTP_USER_AGENT','') if request else '',http_method=request.method if request else '',request_path=request.path if request else '',status_code=getattr(request,'audit_status_code',None) if request else None,before_state=redact(before or {}),after_state=redact(after or {}),metadata=redact(metadata or {}),error_code=error_code,error_message=error_message,previous_hash=payload['previous_hash'],event_hash=digest)
