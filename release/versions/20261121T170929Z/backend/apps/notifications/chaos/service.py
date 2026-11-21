from django.conf import settings
from django.core.exceptions import PermissionDenied

def validate_chaos_request(*,environment,duration_seconds,affected_replicas):
    if not settings.KUBERNETES_DEPLOYMENT_ENABLED: raise PermissionDenied("Kubernetes deployment features are disabled")
    if not settings.CHAOS_ENGINEERING_ENABLED: raise PermissionDenied("Chaos engineering is disabled")
    allowed=[x.strip() for x in settings.CHAOS_ALLOWED_ENVIRONMENTS.split(",") if x.strip()]
    if environment not in allowed: raise PermissionDenied("Environment is not allowlisted for chaos testing")
    if environment.lower() in {"prod","production"} and not settings.CHAOS_ALLOW_PRODUCTION: raise PermissionDenied("Production chaos is disabled")
    if duration_seconds<=0 or duration_seconds>settings.CHAOS_MAX_DURATION_SECONDS: raise ValueError("Chaos duration exceeds configured safe limit")
    if affected_replicas<=0 or affected_replicas>settings.CHAOS_MAX_AFFECTED_REPLICAS: raise ValueError("Affected replica count exceeds configured safe limit")
    return True
