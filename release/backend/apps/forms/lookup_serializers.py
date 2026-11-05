from rest_framework import serializers

from .models import (
    FieldAction,
    FieldOption,
    FieldRule,
    FormDefinition,
    FormField,
    FormSection,
    RuleGroup,
    ValidationRule,
)


class RuntimeOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = (
            "value",
            "label",
            "order",
            "metadata",
        )


class RuntimeValidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationRule
        fields = (
            "validation_type",
            "validation_value",
            "error_message",
            "order",
            "is_active",
        )


class RuntimeFieldSerializer(serializers.ModelSerializer):
    options = RuntimeOptionSerializer(
        many=True,
        read_only=True,
    )

    validations = RuntimeValidationSerializer(
        source="validation_rules",
        many=True,
        read_only=True,
    )

    class Meta:
        model = FormField
        fields = (
            "key",
            "label",
            "field_type",
            "help_text",
            "placeholder",
            "error_message",

            "order",

            "required",
            "disabled",
            "read_only",
            "hidden",

            "default_value",

            "min_length",
            "max_length",
            "regex_pattern",
            "max_selected_items",

            "external_source",
            "metadata",

            "options",
            "validations",
        )


class RuntimeSectionSerializer(serializers.ModelSerializer):
    section_fields = serializers.SerializerMethodField()

    class Meta:
        model = FormSection
        fields = (
            "title",
            "description",
            "order",
            "section_fields",
        )

    def get_section_fields(self, section):
        fields = (
            section.fields
            .filter(is_active=True)
            .order_by("order", "id")
        )

        return RuntimeFieldSerializer(
            fields,
            many=True,
        ).data


class RuntimeRuleSerializer(serializers.ModelSerializer):
    source_key = serializers.CharField(
        source="source_field.key",
        read_only=True,
    )

    target_key = serializers.CharField(
        source="target_field.key",
        read_only=True,
    )

    class Meta:
        model = FieldRule
        fields = (
            "id",
            "source_key",
            "target_key",
            "operator",
            "comparison_value",
            "action",
            "action_value",
            "is_active",
            "order",
        )


class RuntimeActionSerializer(serializers.ModelSerializer):
    target_key = serializers.CharField(
        source="target_field.key",
        read_only=True,
    )

    class Meta:
        model = FieldAction
        fields = (
            "id",
            "target_key",
            "action_type",
            "action_value",
            "is_active",
            "order",
        )


class RuntimeRuleGroupSerializer(serializers.ModelSerializer):
    rules = RuntimeRuleSerializer(
        many=True,
        read_only=True,
    )

    actions = RuntimeActionSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = RuleGroup
        fields = (
            "id",
            "name",
            "evaluation_mode",
            "priority",
            "is_active",
            "rules",
            "actions",
        )


class RuntimeFormSchemaSerializer(serializers.ModelSerializer):
    sections = serializers.SerializerMethodField()
    unsectioned_fields = serializers.SerializerMethodField()
    rule_groups = serializers.SerializerMethodField()

    schema_version = serializers.SerializerMethodField()

    class Meta:
        model = FormDefinition
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "version",
            "schema_version",
            "success_title",
            "success_message",
            "sections",
            "unsectioned_fields",
            "rule_groups",
        )

    def get_schema_version(self, obj):
        return str(obj.version)

    def get_sections(self, obj):
        sections = (
            obj.sections
            .filter(is_active=True)
            .order_by("order", "id")
        )

        return RuntimeSectionSerializer(
            sections,
            many=True,
        ).data

    def get_unsectioned_fields(self, obj):
        fields = (
            obj.fields
            .filter(
                is_active=True,
                section__isnull=True,
            )
            .order_by("order", "id")
        )

        return RuntimeFieldSerializer(
            fields,
            many=True,
        ).data

    def get_rule_groups(self, obj):
        groups = (
            obj.rule_groups
            .filter(is_active=True)
            .order_by("priority", "id")
        )

        return RuntimeRuleGroupSerializer(
            groups,
            many=True,
        ).data