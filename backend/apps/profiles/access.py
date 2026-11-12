from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from apps.profiles.models import EmployeeType

DATA_MARKETPLACE_TEAM_NAME = "Data Marketplace Team"


def can_access_backend(user):
    """True when this account can sign in to the staff backend."""
    if not getattr(user, "is_authenticated", False) or not getattr(user, "pk", None):
        return False
    if not (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
        return False
    if getattr(user, "is_superuser", False):
        return True
    try:
        return bool(user.profile.is_verified)
    except ObjectDoesNotExist:
        return False


def can_edit_roadmap(on_team):
    return bool(on_team)


def can_edit_employee_type(on_team, employee_type, is_superuser=False):
    if is_superuser:
        return True
    return bool(on_team) and employee_type == EmployeeType.EMPLOYEE


def on_data_marketplace_team(user):
    if not getattr(user, "is_authenticated", False) or not getattr(user, "pk", None):
        return False

    from apps.teams.models import Team, TeamMembership

    if user.groups.filter(name=DATA_MARKETPLACE_TEAM_NAME).exists():
        return True
    if Team.objects.filter(name=DATA_MARKETPLACE_TEAM_NAME).filter(Q(owner=user) | Q(members=user)).exists():
        return True
    return TeamMembership.objects.filter(
        user=user,
        is_active=True,
        team__name=DATA_MARKETPLACE_TEAM_NAME,
    ).exists()


def profile_employee_type(user):
    try:
        return user.profile.employee_type or ""
    except (AttributeError, ObjectDoesNotExist):
        return ""


def actor_can_edit_employee_type(user):
    return can_edit_employee_type(
        on_data_marketplace_team(user),
        profile_employee_type(user),
        is_superuser=bool(getattr(user, "is_superuser", False)),
    )
