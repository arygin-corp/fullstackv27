from rest_framework import serializers
from apps.marketplace.models import Classification, Datatype, Domain
from .models import IntakeApprovalEvent, IntakeProductTags, IntakeSecurityEvent, ProductIntake, ProductIntakeAuditLog, UserNotification


class ProductIntakeWriteSerializer(serializers.ModelSerializer):
    marketplace_domain = serializers.PrimaryKeyRelatedField(queryset=Domain.objects.filter(is_active=True))
    marketplace_datatype = serializers.PrimaryKeyRelatedField(queryset=Datatype.objects.filter(is_active=True))
    marketplace_classification = serializers.PrimaryKeyRelatedField(queryset=Classification.objects.filter(is_active=True))

    class Meta:
        model=ProductIntake
        fields=(
            "id","product_name","product_desc","product_type","product_url","product_tags","product_domain",
            "stakeholder_name","product_pii","product_spi","pii_explanation",
            "sample_field1","sample_value1","sample_field2","sample_value2","sample_field3","sample_value3",
            "sample_field4","sample_value4","sample_field5","sample_value5","sample_field6","sample_value6",
            "sample_field7","sample_value7","sample_field8","sample_value8","sample_field9","sample_value9",
            "sample_field10","sample_value10","fulfillment_group",
            "requester_first_name","requester_last_name","requester_email",
            "submitted_by_first_name","submitted_by_last_name","submitted_by_email",
            "marketplace_domain","marketplace_datatype","marketplace_classification","idempotency_key",
        )
        read_only_fields=("id",)

    def validate(self, attrs):
        errors={}
        for field in ("requester_first_name","requester_last_name","requester_email","submitted_by_first_name","submitted_by_last_name","submitted_by_email"):
            if not str(attrs.get(field, "") or "").strip(): errors[field]="This Angular form field is required."
        if attrs.get("product_pii") == "Yes" or attrs.get("product_spi") == "Yes":
            if not (attrs.get("pii_explanation") or "").strip(): errors["pii_explanation"]="Required when PI or SPI is Yes."
        if errors: raise serializers.ValidationError(errors)
        return attrs

    def create(self, validated_data):
        tags=validated_data.pop("product_tags",[]); actor=self.context["request"].user
        obj=ProductIntake.objects.create(created_by=actor,updated_by=actor,**validated_data)
        obj.product_tags.set(tags)
        obj.requester_name=obj.requester_full_name
        obj.save(update_fields=["requester_name","updated_at"])
        return obj

    def update(self, instance, validated_data):
        if instance.status not in {ProductIntake.Status.DRAFT,ProductIntake.Status.REJECTED,ProductIntake.Status.NEEDS_INFORMATION}:
            raise serializers.ValidationError("This intake cannot be edited in its current status.")
        tags=validated_data.pop("product_tags",None)
        for key,value in validated_data.items(): setattr(instance,key,value)
        instance.updated_by=self.context["request"].user; instance.requester_name=instance.requester_full_name; instance.save()
        if tags is not None: instance.product_tags.set(tags)
        return instance


class ProductIntakeReadSerializer(serializers.ModelSerializer):
    requester_full_name=serializers.CharField(read_only=True)
    submitted_by_full_name=serializers.CharField(read_only=True)
    marketplace_product_id=serializers.IntegerField(read_only=True)
    class Meta:
        model=ProductIntake
        fields="__all__"


class ReasonSerializer(serializers.Serializer):
    reason=serializers.CharField(max_length=4000,allow_blank=False,trim_whitespace=True)


class RejectSerializer(serializers.Serializer):
    reason=serializers.CharField(max_length=250,allow_blank=False,trim_whitespace=True)
    comments=serializers.CharField(min_length=10,max_length=4000,allow_blank=False,trim_whitespace=True)


class IntakeApprovalEventSerializer(serializers.ModelSerializer):
    class Meta:
        model=IntakeApprovalEvent
        fields="__all__"


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model=ProductIntakeAuditLog
        fields="__all__"


class SecurityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model=IntakeSecurityEvent
        fields="__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserNotification
        fields="__all__"


class AssignmentSerializer(serializers.Serializer):
    user_id=serializers.IntegerField()
    reason=serializers.CharField(max_length=250,allow_blank=False,trim_whitespace=True)

class MembershipSerializer(serializers.Serializer):
    group=serializers.ChoiceField(choices=["Content Manager Group","Adminsitrator Group","Super Administrator Group"])
    email=serializers.EmailField()
