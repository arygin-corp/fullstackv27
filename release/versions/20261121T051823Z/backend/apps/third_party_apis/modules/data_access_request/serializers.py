from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import (FieldAction, FieldRule, RuleGroup, ValidationRule, FieldOption, FieldType, FormChangeLog, FormDefinition, FormField, FormSection, FormSubmission, SubmissionStatus, SubmissionValue)
from .services.rules import ValidationEngine, RoutingEngine


class OptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FieldOption
        fields = ('id', 'label', 'value', 'order', 'is_active', 'metadata')

class FieldSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = FormField
        fields = '__all__'
        read_only_fields = ('created_by', 'updated_by', 'created_at', 'updated_at')

class SectionSerializer(serializers.ModelSerializer):
    section_fields = FieldSerializer(source='fields', many=True, read_only=True)

    class Meta:
        model = FormSection
        fields = ('id', 'title', 'description', 'order', 'is_active', 'section_fields')

class FormDefinitionSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    unsectioned_fields = serializers.SerializerMethodField()

    class Meta:
        model = FormDefinition
        fields = ('id', 'name', 'slug', 'description', 'version', 'is_active', 'is_published', 'success_title', 'success_message', 'sections', 'unsectioned_fields')

    def get_unsectioned_fields(self, o):
        return FieldSerializer(o.fields.filter(section__isnull=True, is_active=True), many=True).data

class ValueInputSerializer(serializers.Serializer):
    field = serializers.PrimaryKeyRelatedField(queryset=FormField.objects.all())
    value = serializers.JSONField(required=False, allow_null=True)

class SubmissionWriteSerializer(serializers.ModelSerializer):
    values = ValueInputSerializer(many=True)
    context = serializers.DictField(required=False, default=dict)

    class Meta:
        model = FormSubmission
        fields = ('id', 'form', 'status', 'context', 'values')
        read_only_fields = ('id',)

    def validate(self, a):
        form = a['form']
        if not form.is_active or not form.is_published:
            raise serializers.ValidationError({'form': 'Form must be active and published.'})
        fields = list(form.fields.filter(is_active=True).prefetch_related('options', 'validation_rules'))
        byid = {f.id: f for f in fields}
        got = {}
        for item in a['values']:
            if item['field'].id not in byid:
                raise serializers.ValidationError({'values': 'Field does not belong to this form.'})
            got[item['field'].id] = item.get('value')
        errors, states = ValidationEngine.validate(form, {f.id: got.get(f.id, f.default_value) for f in fields})
        if errors:
            raise serializers.ValidationError({'values': errors})
        a['resolved'] = {f.id: states[f.id].value for f in fields if not states[f.id].hidden and (not states[f.id].disabled) and (f.field_type != FieldType.STATIC_TEXT)}
        a['route'] = RoutingEngine.resolve(form, {f.key: states[f.id].value for f in fields})
        return a

    @transaction.atomic
    def create(self, a):
        a.pop('values')
        values = a.pop('resolved')
        route = a.pop('route')
        request = self.context.get('request')
        context = dict(a.get('context', {}))
        context['routing'] = route
        a['context'] = context
        form = a['form']
        submitted = a.get('status') == SubmissionStatus.SUBMITTED
        obj = FormSubmission.objects.create(**a, form_version=form.version, submitted_by=request.user if request and request.user.is_authenticated else None, submitted_at=timezone.now() if submitted else None)
        SubmissionValue.objects.bulk_create([SubmissionValue(submission=obj, field_id=k, value=v) for k, v in values.items()])
        return obj

class ValueReadSerializer(serializers.ModelSerializer):
    key = serializers.CharField(source='field.key', read_only=True)
    label = serializers.CharField(source='field.label', read_only=True)

    class Meta:
        model = SubmissionValue
        fields = ('field', 'key', 'label', 'value')

class SubmissionReadSerializer(serializers.ModelSerializer):
    values = ValueReadSerializer(many=True, read_only=True)

    class Meta:
        model = FormSubmission
        fields = '__all__'
        read_only_fields = tuple((f.name for f in FormSubmission._meta.fields))

class FormChangeLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = FormChangeLog
        fields = '__all__'
        read_only_fields = tuple((f.name for f in FormChangeLog._meta.fields))










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

            # Important for MSAL / Products / lookups
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