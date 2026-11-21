from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from .graph_services import get_person_manager, get_user_photo

from .permissions import PeopleFrontendApplicationPermission
from .serializers import PeopleListQuerySerializer, PeopleSearchQuerySerializer
from .services import (
    InvalidPeopleCursor,
    PeopleDirectoryError,
    list_people,
    search_people,
)


class PeopleAPIView(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        PeopleFrontendApplicationPermission,
    )

    def handle_exception(self, exc):
        if isinstance(exc, PeopleDirectoryError):
            return Response(
                {"error": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return super().handle_exception(exc)


class TenantUserLookupView(PeopleAPIView):
    def get(self, request):
        serializer = PeopleSearchQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        results = search_people(
            request,
            values["q"],
            page_size=values["page_size"],
        )
        return Response({"count": len(results), "results": results})


class TenantUserListView(PeopleAPIView):
    def get(self, request):
        serializer = PeopleListQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        filters = {
            key: values.get(key)
            for key in (
                "display_name",
                "department",
                "company_name",
                "office_location",
                "job_title",
                "account_enabled",
            )
        }

        try:
            page = list_people(
                request,
                page_size=values["page_size"],
                cursor=values.get("cursor") or None,
                filters=filters,
                sort_by=values["sort_by"],
                sort_dir=values["sort_dir"],
            )
        except InvalidPeopleCursor as exc:
            raise ValidationError({"cursor": str(exc)}) from exc

        return Response(
            {
                "count": len(page["results"]),
                "total_count": page["total_count"],
                "page_size": values["page_size"],
                "sort_by": values["sort_by"],
                "sort_dir": values["sort_dir"],
                "filters": {
                    key: value
                    for key, value in filters.items()
                    if value not in (None, "")
                },
                "next_cursor": page["next_cursor"],
                "next_skip_token": page["next_skip_token"],
                "results": page["results"],
            }
        )

class TenantUserManagerView(PeopleAPIView):
    def get(self, request, user_id):
        return Response(
            get_person_manager(request, user_id)
        )

from django.http import HttpResponse

class TenantUserPhotoView(PeopleAPIView):
    def get(self, request, user_id):
        photo = get_user_photo(request, user_id)

        return HttpResponse(
            photo["content"],
            content_type=photo["content_type"],
        )