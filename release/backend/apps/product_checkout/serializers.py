from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import (
    CheckoutStatus,
    ProductCheckoutAnswer,
    ProductCheckoutCondition,
    ProductCheckoutFieldAction,
    ProductCheckoutRequest,
    ProductCheckoutRoutingRule,
    ProductCheckoutRule,
    ProductCheckoutRuleGroup,
    ProductCheckoutValidationRule,
    ProductFulfillment,
    ProductQuestion,
    ProductQuestionOption,
    RequestType,
)
from .services import (
    checkout_context,
    get_product_model,
    next_request_number,
    product_snapshot,
    resolve_routing,
    user_snapshot,
    validate_values,
)


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductQuestionOption
        fields = ("label", "value", "order")


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = ProductQuestion
        fields = (
            "key", "label", "field_type", "help_text", "placeholder",
            "required", "default_value", "min_length", "max_length",
            "regex_pattern", "order", "metadata", "options",
        )

    def get_options(self, obj):
        return OptionSerializer(
            obj.options.filter(is_active=True),
            many=True,
        ).data


class LegacyRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCheckoutRule
        fields = (
            "source_key", "operator", "comparison_value", "target_key",
            "action", "action_value", "order",
        )


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCheckoutCondition
        fields = (
            "source_key", "operator", "comparison_value", "order",
        )


class FieldActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCheckoutFieldAction
        fields = (
            "target_key", "action_type", "action_value", "order",
        )


class RuleGroupSerializer(serializers.ModelSerializer):
    conditions = serializers.SerializerMethodField()
    actions = serializers.SerializerMethodField()

    class Meta:
        model = ProductCheckoutRuleGroup
        fields = (
            "name", "evaluation_mode", "priority", "metadata",
            "conditions", "actions",
        )

    def get_conditions(self, obj):
        return ConditionSerializer(
            obj.conditions.filter(is_active=True),
            many=True,
        ).data

    def get_actions(self, obj):
        return FieldActionSerializer(
            obj.actions.filter(is_active=True),
            many=True,
        ).data


class ValidationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCheckoutValidationRule
        fields = (
            "field_key", "validation_type", "validation_value",
            "error_message", "order",
        )


class RoutingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCheckoutRoutingRule
        fields = (
            "name", "priority", "conditions", "route_identifier",
            "fulfillment_group", "control_group", "organization",
            "ad_group_template", "stop_processing", "metadata",
        )


class CheckoutEvaluateSerializer(serializers.Serializer):
    values = serializers.DictField(
        child=serializers.JSONField(allow_null=True),
        default=dict,
    )


class CheckoutCreateSerializer(serializers.Serializer):
    product_ref = serializers.CharField(max_length=255)
    request_type = serializers.ChoiceField(choices=RequestType.choices)
    target_user_id = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    target_user = serializers.JSONField(required=False, default=dict)
    service_account = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    terms_accepted = serializers.BooleanField(default=False)
    answers = serializers.DictField(
        child=serializers.JSONField(allow_null=True),
        default=dict,
    )

    def validate(self, attrs):
        from .models import ProductCheckoutConfiguration

        try:
            configuration = ProductCheckoutConfiguration.objects.prefetch_related(
                "questions__options",
                "rules",
                "rule_groups__conditions",
                "rule_groups__actions",
                "validation_rules",
                "routing_rules",
            ).get(product_ref=attrs["product_ref"], is_active=True)
        except ProductCheckoutConfiguration.DoesNotExist as exc:
            raise serializers.ValidationError({
                "product_ref": "Active checkout configuration not found."
            }) from exc

        product_model = get_product_model(configuration.product_model)
        try:
            product = product_model._default_manager.get(pk=attrs["product_ref"])
        except product_model.DoesNotExist as exc:
            raise serializers.ValidationError({
                "product_ref": "Product not found."
            }) from exc

        request_type = attrs["request_type"]
        values = dict(attrs["answers"])
        values.update({
            "requesting_id": {
                RequestType.SELF: "Me",
                RequestType.OTHER_USER: "User",
                RequestType.SERVICE_ACCOUNT: "Service Account",
            }[request_type],
            "request_type": request_type,
            "v_dar_objectid_reqfor": attrs.get("target_user_id", ""),
            "v_dar_service_account": attrs.get("service_account", ""),
            "chk_dar_terms_message": attrs["terms_accepted"],
        })

        if request_type == RequestType.OTHER_USER and not configuration.allow_other_user:
            raise serializers.ValidationError({
                "request_type": "Other-user checkout is not allowed."
            })
        if request_type == RequestType.SERVICE_ACCOUNT and not configuration.allow_service_account:
            raise serializers.ValidationError({
                "request_type": "Service-account checkout is not allowed."
            })

        context = checkout_context(product, self.context["request"].user, values)
        errors, states = validate_values(configuration, values, context)
        if errors:
            raise serializers.ValidationError({"answers": errors})

        routing = resolve_routing(configuration, values, context)
        attrs.update(
            configuration=configuration,
            product=product,
            product_snapshot=product_snapshot(product),
            resolved_answers={
                key: state["value"]
                for key, state in states.items()
                if state["visible"] and not state["disabled"]
            },
            routing=routing,
        )
        return attrs

    @transaction.atomic
    def create(self, data):
        request = self.context["request"]
        configuration = data["configuration"]
        routing = data["routing"]
        checkout = ProductCheckoutRequest.objects.create(
            request_number=next_request_number(),
            product_ref=data["product_ref"],
            product_model=configuration.product_model,
            product_snapshot=data["product_snapshot"],
            requestor=request.user,
            requestor_snapshot=user_snapshot(request.user),
            request_type=data["request_type"],
            target_user_id=data.get("target_user_id", ""),
            target_user_snapshot=data.get("target_user", {}),
            service_account=data.get("service_account", ""),
            status=(
                CheckoutStatus.PENDING_APPROVAL
                if configuration.requires_manager_approval
                else CheckoutStatus.SUBMITTED
            ),
            terms_accepted=data["terms_accepted"],
            submitted_at=timezone.now(),
            metadata={"routing": routing},
            created_by=request.user,
            updated_by=request.user,
        )
        labels = {
            question.key: question.label
            for question in configuration.questions.all()
        }
        ProductCheckoutAnswer.objects.bulk_create([
            ProductCheckoutAnswer(
                request=checkout,
                question_key=key,
                question_label=labels.get(key, key),
                value=value,
                created_by=request.user,
                updated_by=request.user,
            )
            for key, value in data["resolved_answers"].items()
        ])
        ProductFulfillment.objects.create(
            request=checkout,
            fulfillment_group=(
                routing.get("fulfillment_group")
                or configuration.fulfillment_group
            ),
            created_by=request.user,
            updated_by=request.user,
        )
        return checkout


class CheckoutRequestSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    routing = serializers.SerializerMethodField()

    class Meta:
        model = ProductCheckoutRequest
        fields = (
            "id", "request_number", "product_ref", "product_snapshot",
            "requestor_snapshot", "request_type", "target_user_snapshot",
            "service_account", "status", "terms_accepted", "submitted_at",
            "answers", "routing",
        )

    def get_answers(self, obj):
        return {
            answer.question_key: answer.value
            for answer in obj.answers.all()
        }

    def get_routing(self, obj):
        return obj.metadata.get("routing", {})
