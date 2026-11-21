import json
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from .models import InstalledThirdPartyApi
@staff_member_required
@csrf_protect
@require_POST
def set_module_state(request,module_key):
    row=get_object_or_404(InstalledThirdPartyApi,module_key=module_key);data=json.loads(request.body or "{}");enabled=data.get("enabled")
    if not isinstance(enabled,bool): return JsonResponse({"error":"enabled must be boolean"},status=400)
    row.enabled=enabled;row.save(update_fields=["enabled","updated_at"]);return JsonResponse({"module_key":row.module_key,"enabled":row.enabled})
@staff_member_required
@csrf_protect
@require_POST
def bulk_module_state(request):
    data=json.loads(request.body or "{}");enabled=data.get("enabled");keys=data.get("module_keys",[])
    if not isinstance(enabled,bool): return JsonResponse({"error":"enabled must be boolean"},status=400)
    return JsonResponse({"updated":InstalledThirdPartyApi.objects.filter(module_key__in=keys).update(enabled=enabled),"enabled":enabled})
