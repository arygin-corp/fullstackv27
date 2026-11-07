from django.http import JsonResponse
from ..platform_models import Tenant
class TenantMiddleware:
 def __init__(self,get_response):self.get_response=get_response
 def __call__(self,request):
  key=request.headers.get('X-Tenant-Key')
  request.tenant=Tenant.objects.filter(key=key,active=True).first() if key else None
  if request.path.startswith('/api/workflows/') and request.tenant is None:return JsonResponse({'detail':'Valid X-Tenant-Key is required.'},status=400)
  return self.get_response(request)
