import uuid


class CorrelationIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            request.correlation_id = uuid.UUID(request.headers.get("X-Correlation-ID", ""))
        except (ValueError, TypeError, AttributeError):
            request.correlation_id = uuid.uuid4()
        response = self.get_response(request)
        response["X-Correlation-ID"] = str(request.correlation_id)
        return response
