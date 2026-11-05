from django.conf import settings
from django.db import connection
from django.http import JsonResponse

def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return JsonResponse({"status":"ok", "database":"ok", "chat_provider":settings.AI_CHAT_PROVIDER, "embedding_provider":settings.AI_EMBEDDING_PROVIDER, "retrieval_provider":settings.RAG_RETRIEVAL_PROVIDER, "storage_provider":settings.DOCUMENT_STORAGE_PROVIDER})
    except Exception:
        return JsonResponse({"status":"unhealthy", "database":"error"}, status=503)
