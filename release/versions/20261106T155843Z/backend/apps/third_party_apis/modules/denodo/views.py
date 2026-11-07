import logging

import requests
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
    try:
        data = services.meta_data_views(request.GET.get("userrolename"))
        return JsonResponse(data, status=200, safe=False)
    except services.DenodoServiceError as error:
        return JsonResponse(error.payload, status=error.status_code, safe=False)
    except requests.HTTPError as error:
        response = error.response
        status_code = response.status_code if response is not None else 500
        try:
            body = response.json() if response is not None else None
        except ValueError:
            body = None
        logger.error("Denodo metadata views upstream error: %s", status_code)
        return JsonResponse(
            body or {"message": "Something went wrong! Please try later."},
            status=status_code,
            safe=False,
        )
    except Exception:
        logger.exception("Denodo metadata views failed")
        return JsonResponse(
            {"message": "Something went wrong! Please try later."},
            status=500,
        )