from rest_framework.permissions import BasePermission

from .access import (
    has_application_access,
    has_team_access,
    is_data_marketplace_platform_owner,
)


def resolve_object_team(obj):
    if obj is None:
        return None

    if hasattr(obj, "owner_team"):
        return obj.owner_team

    if hasattr(obj, "team"):
        return obj.team

    if hasattr(obj, "requesting_team"):
        return obj.requesting_team

    if hasattr(obj, "consumer_team"):
        return obj.consumer_team

    if hasattr(obj, "api") and hasattr(obj.api, "owner_team"):
        return obj.api.owner_team

    if (
        hasattr(obj, "version")
        and hasattr(obj.version, "api")
        and hasattr(obj.version.api, "owner_team")
    ):
        return obj.version.api.owner_team

    if (
        hasattr(obj, "proxy")
        and hasattr(obj.proxy, "api")
        and hasattr(obj.proxy.api, "owner_team")
    ):
        return obj.proxy.api.owner_team

    if (
        hasattr(obj, "revision")
        and hasattr(obj.revision, "proxy")
        and hasattr(obj.revision.proxy, "api")
    ):
        return obj.revision.proxy.api.owner_team

    if hasattr(obj, "product") and hasattr(obj.product, "owner_team"):
        return obj.product.owner_team

    if (
        hasattr(obj, "application")
        and hasattr(obj.application, "owner_team")
    ):
        return obj.application.owner_team

    if (
        hasattr(obj, "subscription")
        and hasattr(obj.subscription, "consumer_team")
    ):
        return obj.subscription.consumer_team

    return None


class HasApplicationGroupAccess(BasePermission):
    message = (
        "Membership in an authorized application access group "
        "is required."
    )

    def has_permission(self, request, view):
        return has_application_access(request.user)


class HasTeamObjectAccess(BasePermission):
    message = "Active membership in the resource team is required."

    def has_object_permission(self, request, view, obj):
        team = resolve_object_team(obj)

        return (
            team is not None
            and has_team_access(request.user, team)
        )


class IsDataMarketplacePlatformOwner(BasePermission):
    message = "Platform-owner access for this team is required."

    def has_object_permission(self, request, view, obj):
        team = resolve_object_team(obj)

        return (
            team is not None
            and is_data_marketplace_platform_owner(
                request.user,
                team,
            )
        )