from rest_framework import serializers
from . import models
from apps.third_party_apis.modules.apify_platforms.tenancy.access import accessible_team_ids


class TeamValidatedModelSerializer(serializers.ModelSerializer):
    team_fields = ()
    related_team_resolvers = {}

    def get_allowed_team_ids(self):
        request = self.context.get("request")

        if request is None:
            return set()

        return set(accessible_team_ids(request.user))

    def validate(self, attrs):
        attrs = super().validate(attrs)
        allowed_team_ids = self.get_allowed_team_ids()

        for field_name in self.team_fields:
            team = attrs.get(
                field_name,
                getattr(self.instance, field_name, None),
            )

            if team is not None and team.pk not in allowed_team_ids:
                raise serializers.ValidationError({
                    field_name: (
                        "You do not have active membership "
                        "in this team."
                    )
                })

        for field_name, resolver in self.related_team_resolvers.items():
            value = attrs.get(field_name)

            if value is None:
                continue

            if hasattr(value, "_meta"):
                values = [value]
            else:
                values = list(value)

            for related_object in values:
                team = resolver(related_object)

                if team is None or team.pk not in allowed_team_ids:
                    raise serializers.ValidationError({
                        field_name: (
                            "A related object is owned by a team "
                            "you cannot access."
                        )
                    })

        return attrs


class ApiSerializer(TeamValidatedModelSerializer):
    team_fields = ("owner_team",)

    class Meta:
        model = models.Api
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
            "created_by",
        ]


class ApiProductSerializer(TeamValidatedModelSerializer):
    team_fields = ("owner_team",)
    related_team_resolvers = {
        "endpoints": lambda endpoint: endpoint.version.api.owner_team,
    }

    class Meta:
        model = models.ApiProduct
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
        ]


class ClientApplicationSerializer(TeamValidatedModelSerializer):
    team_fields = ("owner_team",)

    class Meta:
        model = models.ClientApplication
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
        ]


class ApiAccessRequestSerializer(TeamValidatedModelSerializer):
    team_fields = ("requesting_team",)
    related_team_resolvers = {
        "application": lambda application: application.owner_team,
        "product": lambda product: product.owner_team,
    }

    class Meta:
        model = models.ApiAccessRequest
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
            "requested_by",
        ]


class ApiSubscriptionSerializer(TeamValidatedModelSerializer):
    team_fields = ("consumer_team",)
    related_team_resolvers = {
        "application": lambda application: application.owner_team,
        "product": lambda product: product.owner_team,
        "request": lambda request: request.requesting_team,
    }

    class Meta:
        model = models.ApiSubscription
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
        ]


class EventApiSerializer(TeamValidatedModelSerializer):
    team_fields = ("owner_team",)

    class Meta:
        model = models.EventApi
        fields = "__all__"
        read_only_fields = [
            "tenant",
            "created_at",
            "updated_at",
        ]


NAMES = [
    "Api",
    "ApiVersion",
    "ApiEndpoint",
    "ApiProduct",
    "ApiProxy",
    "ProxyRevision",
    "RuntimeEnvironment",
    "PolicyDefinition",
    "PolicyAttachment",
    "ClientApplication",
    "ApiAccessRequest",
    "ApiSubscription",
    "PortalPublication",
    "DeveloperOrganization",
    "RatePlan",
    "UsageRecord",
    "ApiMetric",
    "EventApi",
    "EventSubscription",
    "RepositoryIntegration",
    "Pipeline",
    "GovernanceProfile",
]

RESTRICTED_NAMES = [
    "ClientCredential",
    "ProxyDeployment",
    "SecurityFinding",
    "ThreatEvent",
    "PipelineRun",
    "AiRecommendation",
    "OutboxEvent",
]


def build_serializer(name):
    serializer_name = f"{name}Serializer"

    if serializer_name in globals():
        return globals()[serializer_name]

    meta = type(
        "Meta",
        (),
        {
            "model": getattr(models, name),
            "fields": "__all__",
            "read_only_fields": [
                "tenant",
                "created_at",
                "updated_at",
            ],
        },
    )

    return type(
        serializer_name,
        (TeamValidatedModelSerializer,),
        {
            "Meta": meta,
        },
    )


for name in NAMES:
    serializer_name = f"{name}Serializer"

    if serializer_name not in globals():
        globals()[serializer_name] = build_serializer(name)

