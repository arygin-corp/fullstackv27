import time
from django.conf import settings
from django.db import connection
from .metrics import inc
class _Timer:
    def __call__(self,execute,sql,params,many,context):
        start=time.perf_counter()
        try: return execute(sql,params,many,context)
        finally:
            elapsed=time.perf_counter()-start
            inc("notification_db_queries_total",persist=False)
            inc("notification_db_query_seconds_total",elapsed,persist=False)
            if elapsed >= settings.ALERT_DB_QUERY_SECONDS:
                inc("notification_db_slow_queries_total",persist=False)
class DatabaseQueryMetricsMiddleware:
    def __init__(self,get_response): self.get_response=get_response
    def __call__(self,request):
        with connection.execute_wrapper(_Timer()): return self.get_response(request)
