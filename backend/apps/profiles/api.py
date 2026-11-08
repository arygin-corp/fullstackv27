from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from apps.orders.authentication import MarketplaceSignInAuthentication
from apps.profiles.access import (
    actor_can_edit_employee_type,
    can_edit_employee_type,
    can_edit_roadmap,
    on_data_marketplace_team,
    profile_employee_type,
)
from apps.profiles.models import EmployeeType, Profile


def _signed_in_emails(request):
    claims = request.auth if isinstance(request.auth, dict) else {}
    emails = []
    for key in ("email", "preferred_username", "upn"):
        value = claims.get(key)
        if isinstance(value, str) and "@" in value:
            email = value.strip()
            if email and email not in emails:
                emails.append(email)
    return emails


def _django_user(request):
    emails = _signed_in_emails(request)
    if not emails:
        return None
    query = Q()
    for email in emails:
        query |= Q(email__iexact=email) | Q(username__iexact=email)
    return get_user_model().objects.filter(query).select_related("profile").first()


def _payload(user):
    if user is None:
        return {
            "employee_type": "",
            "on_data_marketplace_team": False,
            "can_edit_roadmap": False,
            "can_edit_employee_type": False,
        }
    on_team = on_data_marketplace_team(user)
    employee_type = profile_employee_type(user)
    return {
        "employee_type": employee_type,
        "on_data_marketplace_team": on_team,
        "can_edit_roadmap": can_edit_roadmap(on_team),
        "can_edit_employee_type": can_edit_employee_type(
            on_team,
            employee_type,
            is_superuser=bool(user.is_superuser),
        ),
    }


class MarketplaceProfileView(APIView):
    authentication_classes = (MarketplaceSignInAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(_payload(_django_user(request)))

    def patch(self, request):
        user = _django_user(request)
        if user is None or not actor_can_edit_employee_type(user):
            return Response({"detail": "Only a Data Marketplace Team employee can change employee type."}, status=status.HTTP_403_FORBIDDEN)
        value = str(request.data.get("employee_type") or "").strip()
        allowed = {choice for choice, _label in EmployeeType.choices}
        if value not in allowed:
            return Response({"detail": "Employee type must be Employee or Contractor."}, status=status.HTTP_400_BAD_REQUEST)
        profile, _created = Profile.objects.get_or_create(user=user)
        profile.employee_type = value
        profile.save(update_fields=["employee_type"])
        return Response(_payload(user))
