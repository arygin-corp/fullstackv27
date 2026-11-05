from .models import IntegrationAuditLog, InstalledThirdPartyApi
def record_audit(module_key,action,result,request=None,message="",changes=None,metadata=None,duration_ms=None,status_code=None):
    module=InstalledThirdPartyApi.objects.filter(module_key=module_key).first()
    if not module:return None
    actor=request.user if request is not None and getattr(getattr(request,"user",None),"is_authenticated",False) else None
    return IntegrationAuditLog.objects.create(module=module,action=action,result=result,actor=actor,request_method=getattr(request,"method","") if request else "",request_path=getattr(request,"path","") if request else "",status_code=status_code,duration_ms=duration_ms,message=message[:500],changes=changes or {},metadata=metadata or {})
