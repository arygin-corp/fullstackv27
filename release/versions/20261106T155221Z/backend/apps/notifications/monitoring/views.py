import hmac
from django.conf import settings
from django.db import connection
from django.http import HttpResponse,JsonResponse
from django.views.decorators.http import require_GET
from .alerts import evaluate_alerts
from .metrics import prometheus_payload

def _authorized(request):
    if not settings.MONITORING_TOKEN: return settings.APP_ENV != "production"
    supplied=request.headers.get("Authorization",""); expected=f"Bearer {settings.MONITORING_TOKEN}"
    return hmac.compare_digest(supplied,expected)
@require_GET
def live_view(request): return JsonResponse({"status":"live"})
@require_GET
def startup_view(request): return JsonResponse({"status":"started","app":"notifications"})
@require_GET
def ready_view(request):
    checks={"database":False,"redis":None}
    try:
        with connection.cursor() as cursor: cursor.execute("SELECT 1"); cursor.fetchone()
        checks["database"]=True
    except Exception: return JsonResponse({"status":"not_ready","checks":checks},status=503)
    if settings.HEALTH_REDIS_REQUIRED:
        try:
            import redis; redis.Redis.from_url(settings.REDIS_URL,socket_connect_timeout=1,socket_timeout=1).ping(); checks["redis"]=True
        except Exception: checks["redis"]=False; return JsonResponse({"status":"not_ready","checks":checks},status=503)
    return JsonResponse({"status":"ready","checks":checks})
health_view=live_view
@require_GET
def metrics_view(request):
    if not _authorized(request): return JsonResponse({"error":"unauthorized"},status=401)
    data,content_type=prometheus_payload(); return HttpResponse(data,content_type=content_type)
@require_GET
def alerts_view(request):
    if not _authorized(request): return JsonResponse({"error":"unauthorized"},status=401)
    report=evaluate_alerts(); return JsonResponse(report,status=503 if report["alerts"] else 200)
