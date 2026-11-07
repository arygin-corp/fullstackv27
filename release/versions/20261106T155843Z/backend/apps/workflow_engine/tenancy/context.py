from contextvars import ContextVar
_current_tenant=ContextVar('workflow_tenant',default=None)
def get_current_tenant():return _current_tenant.get()
class TenantContext:
 def __init__(self,tenant):self.tenant=tenant
 def __enter__(self):self.token=_current_tenant.set(self.tenant);return self.tenant
 def __exit__(self,*args):_current_tenant.reset(self.token)
class TenantQuerysetMixin:
 def tenant_queryset(self,qs):
  tenant=getattr(self.request,'tenant',None)
  return qs.filter(tenant=tenant) if tenant else qs.none()
