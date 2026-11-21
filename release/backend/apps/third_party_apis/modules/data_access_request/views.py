from dataclasses import field
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (FormChangeLog, FormDefinition, FormSubmission, SubmissionStatus,)
from .serializers import (FormChangeLogSerializer, FormDefinitionSerializer, SubmissionReadSerializer, SubmissionWriteSerializer, RuntimeFormSchemaSerializer)
from .services.rules import (RoutingEngine, RuleConfigurationError, RuleEngine, ValidationEngine,)
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from .admin_views.analytics_context import build_request_source_context
from .admin_views.dashboard_context import DARDashboardContextMixin


class FormDefinitionViewSet(viewsets.ModelViewSet):
    serializer_class = FormDefinitionSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        return [permissions.IsAuthenticated()] if self.request.method in SAFE_METHODS else [permissions.IsAdminUser()]

    def get_queryset(self):
        q = FormDefinition.objects.prefetch_related('sections__fields__options', 'fields__options')
        return q if self.request.user.is_staff else q.filter(is_active=True, is_published=True)

class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        q = FormSubmission.objects.select_related('form', 'submitted_by').prefetch_related('values__field')
        return q if self.request.user.is_staff else q.filter(submitted_by=self.request.user)

    def get_serializer_class(self):
        return SubmissionReadSerializer if self.action in {'list', 'retrieve'} else SubmissionWriteSerializer

    def perform_destroy(self, o):
        if o.status == SubmissionStatus.SUBMITTED:
            raise serializers.ValidationError({'status': 'Submitted requests cannot be deleted.'})
        o.delete()

class FormChangeLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = FormChangeLogSerializer
    queryset = FormChangeLog.objects.select_related('actor')

class FormSchemaView(APIView):
    def get(self, request, slug):
        form = get_object_or_404(
            FormDefinition.objects.prefetch_related(
                "sections__fields__options",
                "sections__fields__validation_rules",
                "fields__options",
                "fields__validation_rules",
                "rule_groups__rules__source_field",
                "rule_groups__rules__target_field",
                "rule_groups__actions__target_field",
            ),
            slug=slug,
            is_active=True,
            is_published=True,
        )

        serializer = RuntimeFormSchemaSerializer(form)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class FormStateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, r, slug):
        form = get_object_or_404(FormDefinition, slug=slug, is_active=True, is_published=True)
        fields = list(form.fields.filter(is_active=True))
        data = r.data.get('data', {})
        states = RuleEngine.resolve(form, {f.id: data.get(f.key, f.default_value) for f in fields})
        return Response({'fields': {f.key: {'hidden': states[f.id].hidden, 'required': states[f.id].required, 'disabled': states[f.id].disabled, 'read_only': states[f.id].read_only, 'value': states[f.id].value} for f in fields}})

class FormSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, r, slug):
        form = get_object_or_404(FormDefinition, slug=slug, is_active=True, is_published=True)
        bykey = {f.key: f for f in form.fields.filter(is_active=True)}
        payload = {'form': form.pk, 'status': r.data.get('status', 'submitted'), 'context': r.data.get('context', {}), 'values': [{'field': bykey[k].pk, 'value': v} for k, v in r.data.get('data', {}).items() if k in bykey]}
        s = SubmissionWriteSerializer(data=payload, context={'request': r})
        s.is_valid(raise_exception=True)
        return Response(SubmissionReadSerializer(s.save()).data, status=status.HTTP_201_CREATED)


class RequestSourceAnalyticsView(LoginRequiredMixin, TemplateView):
    template_name = "gdx_admin/pages/dar/analytics/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(build_request_source_context())
        return context

class FormPreFlightView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        form = get_object_or_404(
            FormDefinition.objects.prefetch_related(
                "fields__options",
                "fields__validation_rules",
                "rule_groups__rules",
                "rule_groups__actions",
                "routing_rules",
            ),
            slug=slug,
            is_active=True,
            is_published=True,
        )

        # ------------------------------------------------------------
        # Validate request envelope
        # ------------------------------------------------------------
        data = request.data.get("data")

        if not isinstance(data, dict):
            raise serializers.ValidationError({
                "data": "Expected an object keyed by field key."
            })

        client_version = request.data.get("form_version")

        if client_version is None:
            raise serializers.ValidationError({
                "form_version": "This field is required."
            })

        try:
            client_version = int(client_version)
        except (TypeError, ValueError):
            raise serializers.ValidationError({
                "form_version": "A valid integer form version is required."
            })

        if client_version != form.version:
            return Response(
                {
                    "valid": False,
                    "code": "schema_version_mismatch",
                    "form_version": form.version,
                    "errors": {
                        "form_version": [
                            "The form definition has changed. Reload the form."
                        ]
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )

        # ------------------------------------------------------------
        # Load active fields and reject unknown Angular keys
        # ------------------------------------------------------------
        fields = list(
            form.fields
            .filter(is_active=True)
            .prefetch_related("options", "validation_rules")
        )

        fields_by_key = {
            field.key: field
            for field in fields
        }

        unknown_keys = sorted(
            set(data.keys()) - set(fields_by_key.keys())
        )

        if unknown_keys:
            return Response(
                {
                    "valid": False,
                    "code": "unknown_fields",
                    "form_version": form.version,
                    "errors": {
                        key: ["Unknown field key."]
                        for key in unknown_keys
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------------------------
        # Convert Angular field-key payload to RuleEngine field IDs
        # ------------------------------------------------------------
        values_by_id = {
            field.id: data.get(
                field.key,
                field.default_value,
            )
            for field in fields
        }

        # ------------------------------------------------------------
        # Resolve rules and run authoritative validation
        #
        # ValidationEngine already calls RuleEngine.resolve().
        # ------------------------------------------------------------
        try:
            errors, states = ValidationEngine.validate(
                form,
                values_by_id,
            )
        except RuleConfigurationError as exc:
            return Response(
                {
                    "valid": False,
                    "code": "rule_configuration_error",
                    "form_version": form.version,
                    "errors": {
                        "rules": [str(exc)]
                    },
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # ------------------------------------------------------------
        # Build effective field state
        # ------------------------------------------------------------
        field_states = {
            field.key: {
                "hidden": states[field.id].hidden,
                "required": states[field.id].required,
                "disabled": states[field.id].disabled,
                "read_only": states[field.id].read_only,
                "value": states[field.id].value,
            }
            for field in fields
        }

        if errors:
            return Response(
                {
                    "valid": False,
                    "code": "validation_failed",
                    "form_version": form.version,
                    "fields": field_states,
                    "errors": {
                        key: (
                            value
                            if isinstance(value, list)
                            else [value]
                        )
                        for key, value in errors.items()
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------------------------
        # Build effective values.
        #
        # Do not forward hidden, disabled, or static-text values
        # to ServiceNow.
        # ------------------------------------------------------------
        effective_data = {
            field.key: states[field.id].value
            for field in fields
            if (
                not states[field.id].hidden
                and not states[field.id].disabled
                and field.field_type != "static_text"
            )
        }

        # RoutingEngine expects values keyed by FormField.key.
        routing_values = {
            field.key: states[field.id].value
            for field in fields
        }

        try:
            routing = RoutingEngine.resolve(
                form,
                routing_values,
            )
        except RuleConfigurationError as exc:
            return Response(
                {
                    "valid": False,
                    "code": "routing_configuration_error",
                    "form_version": form.version,
                    "fields": field_states,
                    "errors": {
                        "routing": [str(exc)]
                    },
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # ------------------------------------------------------------
        # Nothing is persisted here.
        #
        # Angular uses this response to construct the ServiceNow
        # add-to-cart request.
        # ------------------------------------------------------------
        return Response(
            {
                "valid": True,
                "form_version": form.version,
                "data": effective_data,
                "fields": field_states,
                "routing": routing,
                "errors": {},
            },
            status=status.HTTP_200_OK,
        )




class DARDashboardView(DARDashboardContextMixin, TemplateView):
    template_name = "gdx_admin/app/dar/dashboard/dashboard.html"