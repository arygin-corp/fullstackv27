from contextvars import ContextVar
from django.conf import settings
from django.core.exceptions import PermissionDenied
from apps.notifications.models import NotificationTenant, RegisteredApplication, TenantMembership
_current_tenant=ContextVar("notification_tenant",default=None)
_current_application=ContextVar("notification_application",default=None)

def get_current_tenant(): return _current_tenant.get()
def get_current_application(): return _current_application.get()
def set_context(tenant=None,application=None): return _current_tenant.set(tenant),_current_application.set(application)
def reset_context(tokens): _current_tenant.reset(tokens[0]); _current_application.reset(tokens[1])

def default_tenant():
    if not settings.MULTI_TENANCY_ENABLED: return None
    return NotificationTenant.objects.filter(key=settings.DEFAULT_TENANT_KEY,is_active=True).first()

def resolve_request_context(request):
    if not settings.MULTI_TENANCY_ENABLED: return None,None
    key=request.headers.get(settings.TENANT_HEADER_NAME) if settings.TENANT_HEADER_ENABLED else settings.DEFAULT_TENANT_KEY
    tenant=NotificationTenant.objects.filter(key=key,is_active=True).first()
    if not tenant: raise PermissionDenied("Unknown tenant")
    if request.user.is_authenticated and not request.user.is_superuser and not TenantMembership.objects.filter(tenant=tenant,user=request.user,is_active=True).exists(): raise PermissionDenied("Tenant membership required")
    app=None
    app_key=request.headers.get(settings.APPLICATION_HEADER_NAME)
    if app_key: app=RegisteredApplication.objects.filter(tenant=tenant,key=app_key,is_active=True).first()
    return tenant,app

def scope_queryset(qs,tenant=None,application=None):
    if not settings.MULTI_TENANCY_ENABLED: return qs
    tenant=tenant or get_current_tenant() or default_tenant()
    qs=qs.filter(tenant=tenant)
    if application: qs=qs.filter(application=application)
    return qs
