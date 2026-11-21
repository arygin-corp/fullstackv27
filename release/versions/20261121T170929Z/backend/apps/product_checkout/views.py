from rest_framework import generics, permissions, response
from rest_framework.views import APIView

from .models import ProductCheckoutConfiguration, ProductCheckoutRequest
from .serializers import (
    CheckoutCreateSerializer,
    CheckoutEvaluateSerializer,
    CheckoutRequestSerializer,
    LegacyRuleSerializer,
    QuestionSerializer,
    RoutingRuleSerializer,
    RuleGroupSerializer,
    ValidationRuleSerializer,
)
from .services import (
    checkout_context,
    get_product_model,
    product_snapshot,
    resolve_routing,
    user_snapshot,
    validate_values,
)


PREFETCH = (
    "questions__options",
    "rules",
    "rule_groups__conditions",
    "rule_groups__actions",
    "validation_rules",
    "routing_rules",
)


def get_configuration(product_ref):
    return ProductCheckoutConfiguration.objects.prefetch_related(*PREFETCH).get(
        product_ref=str(product_ref),
        is_active=True,
    )


def get_product(configuration, product_ref):
    model = get_product_model(configuration.product_model)
    return model._default_manager.get(pk=product_ref)


class CheckoutContextView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, product_ref):
        try:
            configuration = get_configuration(product_ref)
            product = get_product(configuration, product_ref)
        except ProductCheckoutConfiguration.DoesNotExist:
            return response.Response(
                {"detail": "Active checkout configuration not found."},
                status=404,
            )
        except Exception as exc:
            if exc.__class__.__name__ == "DoesNotExist":
                return response.Response(
                    {"detail": "Product not found."},
                    status=404,
                )
            raise

        return response.Response({
            "schema_version": "2.0",
            "product": product_snapshot(product),
            "current_user": user_snapshot(request.user),
            "configuration": {
                "allow_other_user": configuration.allow_other_user,
                "allow_service_account": configuration.allow_service_account,
                "requires_terms": configuration.requires_terms,
                "requires_manager_approval": (
                    configuration.requires_manager_approval
                ),
            },
            "questions": QuestionSerializer(
                configuration.questions.filter(is_active=True),
                many=True,
            ).data,
            "legacy_rules": LegacyRuleSerializer(
                configuration.rules.filter(is_active=True),
                many=True,
            ).data,
            "rule_groups": RuleGroupSerializer(
                configuration.rule_groups.filter(is_active=True),
                many=True,
            ).data,
            "validation_rules": ValidationRuleSerializer(
                configuration.validation_rules.filter(is_active=True),
                many=True,
            ).data,
            "routing_rules": RoutingRuleSerializer(
                configuration.routing_rules.filter(is_active=True),
                many=True,
            ).data,
        })


class CheckoutEvaluateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, product_ref):
        serializer = CheckoutEvaluateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            configuration = get_configuration(product_ref)
            product = get_product(configuration, product_ref)
        except ProductCheckoutConfiguration.DoesNotExist:
            return response.Response(
                {"detail": "Active checkout configuration not found."},
                status=404,
            )
        values = serializer.validated_data["values"]
        context = checkout_context(product, request.user, values)
        errors, states = validate_values(configuration, values, context)
        routing = resolve_routing(configuration, values, context)
        return response.Response({
            "states": states,
            "errors": errors,
            "routing": routing,
            "valid": not errors,
        })


class CheckoutCreateView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CheckoutCreateSerializer


class MyCheckoutListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CheckoutRequestSerializer

    def get_queryset(self):
        return ProductCheckoutRequest.objects.filter(
            requestor=self.request.user
        ).prefetch_related("answers")


class CheckoutDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CheckoutRequestSerializer
    lookup_field = "id"

    def get_queryset(self):
        queryset = ProductCheckoutRequest.objects.prefetch_related("answers")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(requestor=self.request.user)
