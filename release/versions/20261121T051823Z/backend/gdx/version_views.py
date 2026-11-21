from django.http import JsonResponse
from django.views.decorators.http import require_GET
from .version import public_runtime_metadata

@require_GET
def version_view(request):
    response = JsonResponse(public_runtime_metadata())
    response["Cache-Control"] = "no-store"
    return response
