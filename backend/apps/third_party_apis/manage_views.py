import json
from django.contrib.admin.views.decorators import staff_member_required
from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods

from .audit import record_audit
from .sync import ensure_installed_module

ICON_TYPES = {"image/png", "image/jpeg", "image/webp"}
ICON_LIMIT = 2 * 1024 * 1024


def _icon_url(row):
    icon = getattr(row, "icon_image", None)
    return icon.url if icon else ""


@staff_member_required
@csrf_protect
@require_http_methods(["GET","POST"])
def manage(request,module_key):
    row=ensure_installed_module(module_key)
    if row is None:
        raise Http404("Integration not found")
    if request.method=="GET":return JsonResponse({"module_key":row.module_key,"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config,"icon_url":_icon_url(row)})
    try:data=json.loads(request.body.decode() or "{}")
    except json.JSONDecodeError:return JsonResponse({"error":"Invalid JSON"},status=400)
    removal=data.get("remove")
    if removal in ("soft","instant"):
        from gdx.page_access import granted_actions
        from gdx.removal import allowed_mode, remove_module
        mode=allowed_mode(granted_actions(request.user, "/sa/modules/integrations"), removal)
        if mode is None:return JsonResponse({"error":"This role cannot remove the module that way."},status=403)
        remove_module(module_key, mode)
        record_audit(module_key,"DELETE","SUCCESS",request=request,message="Module soft-deleted for 7 days" if mode=="soft" else "Module removed")
        return JsonResponse({"module_key":module_key,"removed":mode})
    before={"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config}
    row.name=str(data.get("name",row.name))[:200];row.description=str(data.get("description",row.description));row.source_name=str(data.get("source_name",row.source_name))[:200];row.enabled=bool(data.get("enabled",row.enabled));config=data.get("config",row.config)
    if not isinstance(config,dict):return JsonResponse({"error":"config must be an object"},status=400)
    row.config=config;row.save();record_audit(module_key,"UPDATE","SUCCESS",request=request,message="Integration metadata updated",changes={"before":before,"after":{"name":row.name,"description":row.description,"source_name":row.source_name,"enabled":row.enabled,"config":row.config}})
    return JsonResponse({"module_key":row.module_key,"enabled":row.enabled,"icon_url":_icon_url(row)})


@staff_member_required
@csrf_protect
@require_http_methods(["POST"])
def upload_icon(request, module_key):
    row = ensure_installed_module(module_key)
    if row is None:
        raise Http404("Integration not found")
    icon = request.FILES.get("icon")
    if icon is None:
        return JsonResponse({"error": "Choose an icon file."}, status=400)
    if icon.size > ICON_LIMIT:
        return JsonResponse({"error": "Icon must be 2 MB or smaller."}, status=400)
    if icon.content_type not in ICON_TYPES:
        return JsonResponse({"error": "Use a PNG, JPEG, or WebP icon."}, status=400)
    row.icon_image = icon
    row.save(update_fields=["icon_image", "updated_at"])
    record_audit(module_key, "UPDATE", "SUCCESS", request=request, message="Integration icon updated")
    return JsonResponse({"module_key": row.module_key, "icon_url": _icon_url(row)})
