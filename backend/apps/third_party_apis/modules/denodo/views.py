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
        logger.exception("Denodo get-token2 failed")
        return JsonResponse(
            {"message": "Something went wrong! Please try later."},
            status=500,
        )


@require_GET
def table_view(request):
    role = request.GET.get("userrolename")
    try:
        data = services.meta_data_views(role)
    except services.DenodoServiceError as error:
        return JsonResponse(error.payload, status=error.status_code, safe=False)
    except Exception as error:
        data = _stored_schema(role, error)
    if data is None:
        return JsonResponse(
            {"message": "Something went wrong! Please try later."},
            status=500,
        )
    return JsonResponse(data, status=200, safe=False)


def _stored_schema(role, reason):
    logger.warning("Denodo metadata views unavailable (%s); using the stored schema", reason)
    return services.local_metadata_views(role)