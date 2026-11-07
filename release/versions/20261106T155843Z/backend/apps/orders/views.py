from django.db.models import Prefetch, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MarketplaceOrder, Request
from .serializers import NestedOrderHistorySerializer


def authenticated_object_id(request):
    """Return the signed-in user's Entra/MSAL object ID from validated auth claims."""
    auth = request.auth

    if isinstance(auth, dict):
        oid = auth.get("oid") or auth.get("object_id")
    else:
        payload = getattr(auth, "payload", None)
        oid = payload.get("oid") if isinstance(payload, dict) else None

    if not oid:
        oid = getattr(request.user, "object_id", None)

    return str(oid).strip() if oid else ""


class TrackOrderView(APIView):
    """
    Track one signed-in user's order using either a REQ number or an RITM number.

    GET /orders/api/track-order?request_number=REQ000145
    GET /orders/api/track-order?ritm_number=RITM000145
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        request_number = (request.query_params.get("request_number") or "").strip()
        ritm_number = (request.query_params.get("ritm_number") or "").strip()

        if bool(request_number) == bool(ritm_number):
            return Response(
                {
                    "detail": (
                        "Provide exactly one of request_number or ritm_number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        object_id = authenticated_object_id(request)
        if not object_id:
            return Response(
                {"detail": "The authenticated token does not contain an oid claim."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        target_filter = (
            Q(number=request_number)
            if request_number
            else Q(ritm_number=ritm_number)
        )

        # Scope both the parent lookup and nested response to the signed-in user.
        matching_requests = Request.objects.filter(
            Q(object_id=object_id) & target_filter
        ).prefetch_related("tasks")

        marketplace_order = (
            MarketplaceOrder.objects.filter(
                requests__object_id=object_id,
            )
            .filter(
                Q(requests__number=request_number)
                if request_number
                else Q(requests__ritm_number=ritm_number)
            )
            .prefetch_related(
                Prefetch("requests", queryset=matching_requests)
            )
            .distinct()
            .first()
        )

        # Return 404 for both nonexistent and unauthorized identifiers so callers
        # cannot discover another user's order numbers.
        if marketplace_order is None:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            NestedOrderHistorySerializer(marketplace_order).data,
            status=status.HTTP_200_OK,
        )
