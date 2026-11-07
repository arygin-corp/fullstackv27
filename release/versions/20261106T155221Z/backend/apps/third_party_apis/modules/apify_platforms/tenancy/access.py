from django.conf import settings
from django.utils import timezone
from .models import (ApplicationAccessGroup, ApplicationAccessGroupMembership, PlatformOwnership, TeamMembership,)

def _active_membership(user, purpose):
    now = timezone.now()
    return (
        ApplicationAccessGroupMembership.objects.filter(
            user=user,
            is_active=True,
            group__is_active=True,
            group__purpose=purpose,
        )
        .filter(models.Q(valid_from__isnull=True) | models.Q(valid_from__lte=now))
        .filter(models.Q(valid_until__isnull=True) | models.Q(valid_until__gt=now))
        .exists()
    )


from django.db import models


def has_application_access(user):
    if not user or not user.is_authenticated:
        return False
    if (
        getattr(settings, "APIFY_SUPERUSER_BYPASS_ACCESS_GROUP", False)
        and user.is_superuser
    ):
        return True
    return _active_membership(user, ApplicationAccessGroup.Purpose.APP_ACCESS)

def active_team_memberships(user):
    if not user or not user.is_authenticated:
        return TeamMembership.objects.none()

    return TeamMembership.objects.filter(
        user=user,
        is_active=True,
    ).select_related(
        "team",
        "team__tenant",
    )


def accessible_team_ids(user):
    return active_team_memberships(user).values_list(
        "team_id",
        flat=True,
    )


def has_team_access(user, team):
    if not user or not user.is_authenticated or team is None:
        return False

    return TeamMembership.objects.filter(
        user=user,
        team=team,
        is_active=True,
    ).exists()


def is_data_marketplace_platform_owner(user, team):
    if (
        not user
        or not user.is_authenticated
        or team is None
        or not has_application_access(user)
    ):
        return False

    now = timezone.now()

    return (
        PlatformOwnership.objects
        .filter(
            team=team,
            is_active=True,
            team__memberships__user=user,
            team__memberships__is_active=True,
            owner_group__is_active=True,
            owner_group__purpose=(ApplicationAccessGroup.Purpose.PLATFORM_OWNER),
            owner_group__memberships__user=user,
            owner_group__memberships__is_active=True,
        )
        .filter(
            models.Q(owner_group__memberships__valid_from__isnull=True,)
            | models.Q(owner_group__memberships__valid_from__lte=now,)
        )
        .filter(
            models.Q(owner_group__memberships__valid_until__isnull=True,)
            | models.Q(owner_group__memberships__valid_until__gt=now,)
        )
        .exists()
    )


def access_decision(user, team=None):
    allowed = has_application_access(user)

    return {
        "allowed": allowed,
        "platform_owner": (
            allowed
            and team is not None
            and is_data_marketplace_platform_owner(user, team)
        ),
        "reason": (
            "allowed"
            if allowed
            else "required_group_membership_missing"
        ),
    }
