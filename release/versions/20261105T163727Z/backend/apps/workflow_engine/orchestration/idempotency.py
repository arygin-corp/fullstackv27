import hashlib,json
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from ..security_models import IdempotencyRecord
class IdempotencyService:
 @staticmethod
 @transaction.atomic
 def execute(*,tenant,key,operation,payload,callable,ttl_hours=24):
  digest=hashlib.sha256(json.dumps(payload,sort_keys=True,default=str).encode()).hexdigest();existing=IdempotencyRecord.objects.select_for_update().filter(tenant=tenant,key=key,operation=operation).first()
  if existing:
   if existing.request_hash!=digest:raise ValueError('Idempotency key reused with a different request')
   return existing.response,False
  response=callable();stored=response if isinstance(response,dict) else {'id':getattr(response,'pk',None)}
  IdempotencyRecord.objects.create(tenant=tenant,key=key,operation=operation,request_hash=digest,response=stored,resource_type=type(response).__name__,resource_id=str(getattr(response,'pk','')),expires_at=timezone.now()+timedelta(hours=ttl_hours));return stored,True
