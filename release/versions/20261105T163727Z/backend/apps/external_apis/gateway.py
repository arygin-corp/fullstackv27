from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from .audit import create_api_audit
from .exceptions import ExternalApiConfigurationError, ExternalApiRequestError, GatewayIdempotencyConflict, GatewayRateLimitError
from .handlers import PLATFORM_HANDLERS
from .models import APIRequestAudit, PublishedEndpoint
from .permissions import PublishedEndpointPermission
from .runtime import enforce_rate_limit, get_or_create_idempotency, request_digest
from .services import execute_api

class PublishedGatewayView(APIView):
    permission_classes = (PublishedEndpointPermission,)
    def initial(self, request, *args, **kwargs):
        request.published_endpoint = get_object_or_404(PublishedEndpoint.objects.select_related("configuration"), public_version=kwargs["version"], public_slug=kwargs["public_slug"], enabled=True)
        super().initial(request, *args, **kwargs)
    def execute(self, request):
        endpoint = request.published_endpoint
        if request.method not in {str(v).upper() for v in endpoint.allowed_methods}: return Response({"detail": "Method not allowed."}, status=405)
        remaining = enforce_rate_limit(endpoint, request.frontend_application)
        idem = None
        if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.headers.get("Idempotency-Key"):
            digest = request_digest(request.method, request.path, dict(request.query_params), request.data)
            idem, created = get_or_create_idempotency(endpoint, request.frontend_application, request.headers["Idempotency-Key"], digest, timezone.now() + timedelta(hours=24))
            if not created and idem.response_status is not None: return Response(idem.response_body, status=idem.response_status)
        if endpoint.target_type == PublishedEndpoint.TargetType.CONSUMED_API:
            result = execute_api(endpoint.configuration.slug, version=endpoint.configuration.version, request=request, params=request.query_params, json_body=request.data if request.method != "GET" else None, enforce_declared_parameters=True)
        else:
            handler = PLATFORM_HANDLERS.get(endpoint.handler_name)
            if handler is None: raise ExternalApiConfigurationError("The platform handler is not registered.")
            result = handler(request)
        response = Response(result)
        response["X-RateLimit-Remaining"] = str(remaining)
        if idem is not None:
            idem.response_status = response.status_code; idem.response_body = result; idem.save(update_fields=("response_status", "response_body"))
        create_api_audit(request=request, direction=APIRequestAudit.Direction.INBOUND, api_configuration=endpoint.configuration, configuration_version=getattr(endpoint.configuration, "version", None), status=APIRequestAudit.Status.SUCCESS, rate_limit_remaining=remaining)
        return response
    get = post = put = patch = delete = lambda self, request, *args, **kwargs: self.execute(request)
    def handle_exception(self, exc):
        if isinstance(exc, GatewayRateLimitError): return Response({"detail": str(exc), "code": "rate_limited"}, status=429)
        if isinstance(exc, GatewayIdempotencyConflict): return Response({"detail": str(exc), "code": "idempotency_conflict"}, status=409)
        if isinstance(exc, ExternalApiConfigurationError): return Response({"detail": str(exc), "code": "configuration_error"}, status=503)
        if isinstance(exc, ExternalApiRequestError): return Response({"detail": str(exc), "code": "upstream_error"}, status=502)
        if isinstance(exc, ValueError): return Response({"detail": str(exc), "code": "validation_error"}, status=400)
        return super().handle_exception(exc)
