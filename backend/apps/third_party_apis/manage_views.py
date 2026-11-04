import json
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from .audit import record_audit
from .models import InstalledThirdPartyApi
@staff_member_required
@csrf_protect
@require_http_methods(["GET","POST"])
def manage(request,module_key):
    row=get_object_or_404(InstalledThirdPartyApi,module_key=module_key)
    if request.method=="GET":return JsonResponse({"module_key":row.module_key,"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config})
    try:data=json.loads(request.body.decode() or "{}")
    except json.JSONDecodeError:return JsonResponse({"error":"Invalid JSON"},status=400)
    before={"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config}
    row.name=str(data.get("name",row.name))[:200];row.description=str(data.get("description",row.description));row.source_name=str(data.get("source_name",row.source_name))[:200];row.enabled=bool(data.get("enabled",row.enabled));config=data.get("config",row.config)
    if not isinstance(config,dict):return JsonResponse({"error":"config must be an object"},status=400)
    row.config=config;row.save();record_audit(module_key,"UPDATE","SUCCESS",request=request,message="Integration metadata updated",changes={"before":before,"after":{"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config}})
    return JsonResponse({"module_key":row.module_key,"enabled":row.enabled})
