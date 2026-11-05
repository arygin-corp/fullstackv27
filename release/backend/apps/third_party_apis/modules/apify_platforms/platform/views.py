from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.third_party_apis.modules.apify_platforms.tenancy.access import accessible_team_ids
from apps.third_party_apis.modules.apify_platforms.tenancy.permissions import (
    HasApplicationGroupAccess,
    HasTeamObjectAccess,
)

from . import models, serializers


NAMES = serializers.NAMES


TEAM_LOOKUPS = {
    "Api": "owner_team_id",
    "ApiVersion": "api__owner_team_id",
    "ApiEndpoint": "version__api__owner_team_id",
    "ApiProduct": "owner_team_id",
    "ApiProxy": "api__owner_team_id",
    "ProxyRevision": "proxy__api__owner_team_id",
    "PolicyAttachment": "proxy__api__owner_team_id",
    "ClientApplication": "owner_team_id",
    "ApiAccessRequest": "requesting_team_id",
    "ApiSubscription": "consumer_team_id",
    "PortalPublication": "product__owner_team_id",
    "RatePlan": "product__owner_team_id",
    "UsageRecord": "subscription__consumer_team_id",
    "ApiMetric": "proxy__api__owner_team_id",
    "EventApi": "owner_team_id",
    "EventSubscription": "application__owner_team_id",
    "GovernanceProfile": "api__owner_team_id",
}


def resolve_validated_team(name, validated_data):
    if "owner_team" in validated_data:
        return validated_data["owner_team"]

    if "requesting_team" in validated_data:
        return validated_data["requesting_team"]

    if "consumer_team" in validated_data:
        return validated_data["consumer_team"]

    api = validated_data.get("api")
    if api is not None:
        return api.owner_team

    version = validated_data.get("version")
    if version is not None:
        return version.api.owner_team

    proxy = validated_data.get("proxy")
    if proxy is not None:
        return proxy.api.owner_team

    revision = validated_data.get("revision")
    if revision is not None:
        return revision.proxy.api.owner_team

    product = validated_data.get("product")
    if product is not None:
        return product.owner_team

    application = validated_data.get("application")
    if application is not None:
        return application.owner_team

    subscription = validated_data.get("subscription")
    if subscription is not None:
        return subscription.consumer_team

    return None


def make(name):
    model = getattr(models, name)
    serializer_cls = getattr(
        serializers,
        f"{name}Serializer",
    )

    team_lookup = TEAM_LOOKUPS.get(name)

    class GeneratedViewSet(viewsets.ModelViewSet):
        permission_classes = [
            IsAuthenticated,
            HasApplicationGroupAccess,
            HasTeamObjectAccess,
        ]

        queryset = model.objects.all()

        def get_queryset(self):
            if team_lookup is None:
                return model.objects.none()

            team_ids = accessible_team_ids(self.request.user)

            return model.objects.filter(
                **{
                    f"{team_lookup}__in": team_ids,
                }
            ).distinct()

        def perform_create(self, serializer):
            request = self.request

            if not accessible_team_ids(request.user).exists():
                raise PermissionDenied(
                    "Active team membership is required."
                )

            save_kwargs = {}

            if name == "Api":
                save_kwargs["created_by"] = request.user

            if name == "ApiAccessRequest":
                save_kwargs["requested_by"] = request.user

            team = resolve_validated_team(
                name,
                serializer.validated_data,
            )

            if team is not None:
                save_kwargs["tenant"] = team.tenant
            elif getattr(request, "tenant", None) is not None:
                save_kwargs["tenant"] = request.tenant
            else:
                raise PermissionDenied(
                    "A tenant context or team-owned relationship is required."
                )

            serializer.save(**save_kwargs)

    # Assign dynamic attributes AFTER class creation
    GeneratedViewSet.serializer_class = serializer_cls
    GeneratedViewSet.__name__ = f"{name}ViewSet"

    return GeneratedViewSet


globals().update(
    {
        f"{name}ViewSet": make(name)
        for name in NAMES
    }
)