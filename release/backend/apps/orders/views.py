from datetime import datetime, timezone as datetime_timezone

from django.db.models import Prefetch, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.marketplace.models import Product
from apps.third_party_apis.modules.product_intake.models import ProductIntake

from .authentication import MarketplaceSignInAuthentication
from .models import MarketplaceOrder, Request, UserActivity
from .serializers import NestedOrderHistorySerializer, OrderHistoryRequestSerializer


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

    GET /api/orders/track-order/?request_number=REQ000145
    GET /api/orders/track-order/?ritm_number=RITM000145
    """

    authentication_classes = (MarketplaceSignInAuthentication,)
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

        if marketplace_order is not None:
            return Response(
                NestedOrderHistorySerializer(marketplace_order).data,
                status=status.HTTP_200_OK,
            )

        # Requests synced before a marketplace order row exists are still trackable.
        request_rows = list(matching_requests)
        if not request_rows:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        first = request_rows[0]
        return Response(
            {
                "marketplace_order_id": first.number,
                "sync_status": first.stage or first.ritm_state or "PENDING",
                "created_at": first.created_at,
                "updated_at": first.updated_at,
                "requests": OrderHistoryRequestSerializer(request_rows, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


def signed_in_email(request):
    claims = request.auth if isinstance(request.auth, dict) else {}
    for key in ("preferred_username", "email", "upn"):
        value = claims.get(key)
        if isinstance(value, str) and "@" in value:
            return value.strip()
    return (getattr(request.user, "email", "") or "").strip()


def product_images(product_ids):
    numeric = []
    slugs = []
    for value in product_ids:
        text = str(value or "").strip()
        if text.isdigit():
            numeric.append(int(text))
        elif text:
            slugs.append(text)
    images = {}
    products = []
    if numeric:
        products.extend(Product.objects.filter(id__in=numeric).prefetch_related("images"))
    if slugs:
        products.extend(Product.objects.filter(slug__in=slugs).prefetch_related("images"))
    for product in products:
        image = ""
        first = product.images.first()
        if first and first.image:
            image = first.image.url
        images[str(product.id)] = image
        images[product.slug] = image
    return images


def product_names(product_ids):
    numeric = []
    slugs = []
    for value in product_ids:
        text = str(value or "").strip()
        if text.isdigit():
            numeric.append(int(text))
        elif text:
            slugs.append(text)
    names = {}
    if numeric:
        for product in Product.objects.filter(id__in=numeric).only("id", "name"):
            names[str(product.id)] = product.name
    if slugs:
        for product in Product.objects.filter(slug__in=slugs).only("slug", "name"):
            names[product.slug] = product.name
    return names


def activity_tone(status_text):
    text = (status_text or "").casefold()
    if any(word in text for word in ("approv", "complete", "closed", "implement", "fulfill")):
        return "success"
    if any(word in text for word in ("reject", "cancel", "fail")):
        return "danger"
    if text and text not in {"submitted", "draft"}:
        return "primary"
    return "secondary"


ACTIVITY_TITLES = {
    "cart_add": "Added to cart",
    "cart_remove": "Removed from cart",
    "favorite_add": "Added to favorites",
    "favorite_remove": "Removed from favorites",
    "compare_add": "Added to compare",
    "compare_remove": "Removed from compare",
    "checkout": "Checked out",
    "order_submitted": "Order submitted",
    "data_access_request": "Data access requested",
    "track_request": "Tracked request",
}


class RecentOrdersView(APIView):
    """The signed-in account's newest marketplace orders."""

    authentication_classes = (MarketplaceSignInAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        object_id = authenticated_object_id(request)
        email = signed_in_email(request)
        if not object_id and not email:
            return Response(
                {"detail": "The authenticated token does not identify this account."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        queryset = Request.objects.all()
        identity = Q()
        if object_id:
            identity |= Q(object_id=object_id)
        if email:
            identity |= Q(requested_for__iexact=email) | Q(opened_by__iexact=email)
        try:
            limit = int(request.query_params.get("limit") or 3)
        except (TypeError, ValueError):
            limit = 3
        limit = min(max(limit, 1), 100)
        rows = list(queryset.filter(identity).order_by("-opened_at", "-created_at")[:limit])
        ids = [row.product_id for row in rows]
        names = product_names(ids)
        images = product_images(ids)
        items = []
        for row in rows:
            key = str(row.product_id or "").strip()
            status_text = row.stage or row.ritm_state or "Submitted"
            items.append({
                "id": row.number or str(row.id),
                "number": row.ritm_number or "",
                "open_by": row.opened_by or row.requested_for or "",
                "openedAt": row.opened_at or row.created_at,
                "status": status_text.replace("_", " "),
                "approval": (row.approval_stage or "Waiting").replace("_", " "),
                "requestedFor": row.requested_for or "",
                "approver": row.ritm_assigned_to or "",
                "pendingApprovalDate": None,
                "product": {
                    "name": names.get(key) or "Catalog product",
                    "image": images.get(key) or "",
                },
            })
        return Response(items)


class ProfileActivityView(APIView):
    """Activity for the signed-in marketplace user, including actions captured in the app."""

    authentication_classes = (MarketplaceSignInAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        action = str(request.data.get("action") or "").strip()
        title = ACTIVITY_TITLES.get(action)
        if not title:
            return Response({"detail": "Unknown activity."}, status=status.HTTP_400_BAD_REQUEST)
        object_id = authenticated_object_id(request)
        email = signed_in_email(request)
        if not object_id and not email:
            return Response(
                {"detail": "The authenticated token does not identify this account."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        raw_payload = request.data.get("payload")
        UserActivity.objects.create(
            object_id=object_id,
            email=email,
            action=action,
            title=title,
            detail=str(request.data.get("detail") or "").strip()[:255],
            reference=str(request.data.get("reference") or "").strip()[:255],
            payload=raw_payload if isinstance(raw_payload, dict) else {},
        )
        return Response(status=status.HTTP_201_CREATED)

    def get(self, request):
        items = []
        object_id = authenticated_object_id(request)
        if object_id:
            rows = list(Request.objects.filter(object_id=object_id).order_by("-created_at")[:20])
            names = product_names([row.product_id for row in rows])
            for row in rows:
                status_text = row.stage or row.ritm_state or row.approval_stage or "Submitted"
                items.append({
                    "id": f"request-{row.id}",
                    "title": "Access requested",
                    "detail": names.get(str(row.product_id or "").strip()) or "Catalog product",
                    "reference": row.number or row.ritm_number or "",
                    "status": status_text.replace("_", " "),
                    "tone": activity_tone(status_text),
                    "occurred_at": row.opened_at or row.created_at,
                })

        email = signed_in_email(request)
        captured = UserActivity.objects.all()
        if object_id and email:
            captured = captured.filter(Q(object_id=object_id) | Q(email__iexact=email))
        elif object_id:
            captured = captured.filter(object_id=object_id)
        elif email:
            captured = captured.filter(email__iexact=email)
        else:
            captured = captured.none()
        for row in captured.order_by("-created_at")[:20]:
            items.append({
                "id": f"activity-{row.id}",
                "title": row.title,
                "detail": row.detail or "Marketplace",
                "reference": row.reference,
                "status": row.action.replace("_", " "),
                "tone": "success" if row.action == "checkout" else "primary",
                "occurred_at": row.created_at,
            })

        if email:
            intakes = ProductIntake.objects.filter(
                Q(requester_email__iexact=email) | Q(submitted_by_email__iexact=email)
            ).order_by("-created_at")[:20]
            for row in intakes:
                status_text = (row.status or "draft").replace("_", " ")
                items.append({
                    "id": f"intake-{row.id}",
                    "title": row.product_name or "Product request",
                    "detail": "Product request",
                    "reference": "",
                    "status": status_text,
                    "tone": activity_tone(row.status or ""),
                    "occurred_at": row.submitted_at or row.created_at,
                })

        empty = datetime.min.replace(tzinfo=datetime_timezone.utc)
        items.sort(key=lambda item: item["occurred_at"] or empty, reverse=True)
        return Response(items[:20])
