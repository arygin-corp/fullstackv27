import logging

from django.http import JsonResponse
from django.views.decorators.http import require_GET

from . import services

logger = logging.getLogger(__name__)


@require_GET
def get_token(request):
    try:
        token = services.get_token()
        return JsonResponse({"message": "Success", "accessToken": token}, status=200)
    except Exception:
        logger.exception("Axon get-token failed")
        return JsonResponse({"message": "Something went wrong! Please try later."}, status=500)


@require_GET
def axon_facet_search(request):
    return _search_response(request, services.axon_facet_search, "axon-facet-search")


@require_GET
def axon_glossary(request):
    return _search_response(request, services.axon_glossary_search, "axon-glossary")


def _search_response(request, search, label):
    try:
        data = search(request.GET.get("id"))
    except services.AxonServiceError as error:
        logger.warning("%s failed: %s", label, error.message)
        return JsonResponse(error.payload, status=error.status_code, safe=False)
    except Exception:
        logger.exception("%s failed", label)
        return JsonResponse({"message": "Something went wrong! Please try later."}, status=500)
    return JsonResponse(data, status=200, safe=False)
