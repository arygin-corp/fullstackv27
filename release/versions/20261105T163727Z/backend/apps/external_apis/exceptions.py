class ExternalApiError(Exception):
    """Base gateway exception."""

class ExternalApiConfigurationError(ExternalApiError):
    """An approved API configuration is missing or invalid."""

class ExternalApiRequestError(ExternalApiError):
    """An upstream request failed or returned invalid data."""

class GatewayAuthorizationError(ExternalApiError):
    """A caller is not authorized for a published endpoint."""

class GatewayRateLimitError(ExternalApiError):
    """A published endpoint quota was exceeded."""

class GatewayIdempotencyConflict(ExternalApiError):
    """An idempotency key was reused for a different request."""
