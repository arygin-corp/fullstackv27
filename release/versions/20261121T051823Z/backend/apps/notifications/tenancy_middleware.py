from apps.notifications.services.tenancy import resolve_request_context, reset_context, set_context
class TenantContextMiddleware:
    def __init__(self,get_response): self.get_response=get_response
    def __call__(self,request):
        tenant,application=resolve_request_context(request)
        request.notification_tenant=tenant; request.notification_application=application
        tokens=set_context(tenant,application)
        try: return self.get_response(request)
        finally: reset_context(tokens)
