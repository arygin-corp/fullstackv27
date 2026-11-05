"""Database models for the platform-owned ``external_apis`` API Gateway.

The gateway has two responsibilities:

1. Publish APIs exposed by the platform to registered consumer applications.
2. Configure and execute approved external APIs consumed by the platform.

This module intentionally does not contain workflow/domain models such as
``ServiceRequest`` or ``ServiceTask``.
"""

from __future__ import annotations

import uuid
from urllib.parse import urljoin, urlparse

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.utils import timezone


# ---------------------------------------------------------------------------
# Shared abstract models
# ---------------------------------------------------------------------------


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserTrackedModel(TimeStampedModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    class Meta:
        abstract = True


# ---------------------------------------------------------------------------
# APIs consumed BY the platform
# ---------------------------------------------------------------------------


class APIConfiguration(UserTrackedModel):
    """A versioned, approved upstream API operation consumed by the platform."""

    class Method(models.TextChoices):
        GET = "GET", "GET"
        POST = "POST", "POST"
        PUT = "PUT", "PUT"
        PATCH = "PATCH", "PATCH"
        DELETE = "DELETE", "DELETE"
        HEAD = "HEAD", "HEAD"
        OPTIONS = "OPTIONS", "OPTIONS"

    class Environment(models.TextChoices):
        PRODUCTION = "production", "Production"
        STAGE = "stage", "Stage"
        QA = "qa", "QA"
        DEV = "dev", "Dev"
        DEMO = "demo", "Demo"
        SANDBOX = "sandbox", "Sandbox"

    class Lifecycle(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        DEPRECATED = "deprecated", "Deprecated"
        DISABLED = "disabled", "Disabled"

    class AuthenticationType(models.TextChoices):
        NONE = "none", "None"
        BASIC = "basic", "Basic authentication"
        BEARER = "bearer", "Bearer token"
        BEARER_ENV = "bearer_env", "Bearer token from environment"
        API_KEY = "api_key", "API key"
        OAUTH2_CLIENT_CREDENTIALS = (
            "oauth2_client_credentials",
            "OAuth 2.0 client credentials",
        )
        MANAGED_IDENTITY = "managed_identity", "Managed identity"
        SPECIALIZED_ADAPTER = "specialized_adapter", "Approved specialized adapter"

    class APIKeyLocation(models.TextChoices):
        HEADER = "header", "Header"
        QUERY = "query", "Query string"

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150)
    version = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)

    owner_team = models.CharField(max_length=150, blank=True)
    support_contact = models.EmailField(blank=True)
    environment = models.CharField(
        max_length=40,
        choices=Environment.choices,
        default=Environment.DEV,
    )

    lifecycle = models.CharField(
        max_length=20,
        choices=Lifecycle.choices,
        default=Lifecycle.DRAFT,
    )
    active = models.BooleanField(default=False)

    base_url = models.URLField(max_length=500)
    endpoint = models.CharField(
        max_length=500,
        blank=True,
        help_text="Relative upstream path. It must not replace the configured host.",
    )
    http_method = models.CharField(
        max_length=10,
        choices=Method.choices,
        default=Method.GET,
    )

    auth_type = models.CharField(
        max_length=40,
        choices=AuthenticationType.choices,
        default=AuthenticationType.NONE,
    )
    # Environment-variable names used to resolve credentials at runtime.
    username_env_var = models.CharField(max_length=150, blank=True)
    password_env_var = models.CharField(max_length=150, blank=True)
    bearer_token_env_var = models.CharField(max_length=150, blank=True)
    api_key_enabled = models.BooleanField(
        default=False,
        help_text="Enable an outbound API key in addition to the selected authentication type.",
    )
    api_key_env_var = models.CharField(max_length=150, blank=True)
    api_key_name = models.CharField(max_length=150, blank=True)
    api_key_location = models.CharField(
        max_length=16,
        choices=APIKeyLocation.choices,
        default=APIKeyLocation.HEADER,
    )

    # A specialized adapter is selected from a code-owned allowlist. This is
    # deliberately not an arbitrary Python import path.
    adapter_name = models.SlugField(max_length=100, blank=True)

    default_headers = models.JSONField(default=dict, blank=True)
    request_template = models.JSONField(default=dict, blank=True)
    request_schema = models.JSONField(default=dict, blank=True)
    response_schema = models.JSONField(default=dict, blank=True)
    response_path = models.CharField(max_length=255, blank=True)

    connection_timeout_seconds = models.PositiveIntegerField(default=5)
    timeout_seconds = models.PositiveIntegerField(default=15)
    retry_attempts = models.PositiveSmallIntegerField(default=1)
    retry_status_codes = models.JSONField(
        default=list,
        blank=True,
        help_text="Approved HTTP status codes eligible for retry.",
    )

    verify_ssl = models.BooleanField(default=True)
    allow_redirects = models.BooleanField(default=False)
    approved_hosts = models.JSONField(default=list, blank=True)
    allowed_content_types = models.JSONField(default=list, blank=True)
    maximum_request_bytes = models.PositiveIntegerField(default=1_000_000)
    maximum_response_bytes = models.PositiveIntegerField(default=5_000_000)
    cache_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("name", "-version")
        verbose_name = "API Configuration"
        verbose_name_plural = "API Configurations"
        constraints = [
            models.UniqueConstraint(
                fields=("slug", "version"),
                name="unique_api_slug_version",
            ),
            models.CheckConstraint(
                check=Q(version__gte=1),
                name="api_config_version_positive",
            ),
            models.CheckConstraint(
                check=Q(retry_attempts__gte=1) & Q(retry_attempts__lte=5),
                name="api_retry_attempts_1_5",
            ),
            models.CheckConstraint(
                check=Q(connection_timeout_seconds__gte=1),
                name="api_connect_timeout_positive",
            ),
            models.CheckConstraint(
                check=Q(timeout_seconds__gte=1),
                name="api_read_timeout_positive",
            ),
            models.CheckConstraint(
                check=Q(maximum_request_bytes__gte=1),
                name="api_request_size_positive",
            ),
            models.CheckConstraint(
                check=Q(maximum_response_bytes__gte=1),
                name="api_response_size_positive",
            ),
        ]
        indexes = [
            models.Index(
                fields=("slug", "lifecycle", "active"),
                name="api_config_runtime_lookup",
            ),
            models.Index(
                fields=("environment", "lifecycle"),
                name="api_config_env_state",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} v{self.version}"

    @property
    def full_url(self) -> str:
        return urljoin(self.base_url.rstrip("/") + "/", self.endpoint.lstrip("/"))

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}
        parsed_base = urlparse(self.base_url)

        if self.lifecycle == self.Lifecycle.ACTIVE or self.active:
            if parsed_base.scheme != "https":
                errors["base_url"] = "Active configurations must use HTTPS."
            if not self.approved_hosts:
                errors["approved_hosts"] = "Active configurations require approved hosts."
            if not self.owner_team.strip():
                errors["owner_team"] = "Active configurations require an owner team."
            if not self.verify_ssl:
                errors["verify_ssl"] = "SSL verification is required for active configurations."

        if self.endpoint:
            parsed_endpoint = urlparse(self.endpoint)
            if parsed_endpoint.scheme or parsed_endpoint.netloc:
                errors["endpoint"] = "Endpoint must be a relative path."

        approved_hosts = {
            str(host).strip().casefold()
            for host in (self.approved_hosts or [])
            if str(host).strip()
        }
        if parsed_base.hostname and approved_hosts:
            if parsed_base.hostname.casefold() not in approved_hosts:
                errors["approved_hosts"] = "The base URL host must be approved."

        if self.auth_type == self.AuthenticationType.BASIC:
            if not self.username_env_var.strip():
                errors["username_env_var"] = "A username environment variable is required."
            if not self.password_env_var.strip():
                errors["password_env_var"] = "A password environment variable is required."
        if self.auth_type in {
            self.AuthenticationType.BEARER,
            self.AuthenticationType.BEARER_ENV,
        } and not self.bearer_token_env_var.strip():
            errors["bearer_token_env_var"] = "A bearer-token environment variable is required."
        if (
            self.auth_type == self.AuthenticationType.SPECIALIZED_ADAPTER
            and not self.adapter_name
        ):
            errors["adapter_name"] = "A registered adapter name is required."

        if self.auth_type == self.AuthenticationType.API_KEY and not self.api_key_enabled:
            errors["api_key_enabled"] = "API key must be enabled when API key authentication is selected."
        if self.api_key_enabled:
            if not self.api_key_name.strip():
                errors["api_key_name"] = "An upstream API-key name is required when API key is enabled."
            if not self.api_key_env_var.strip():
                errors["api_key_env_var"] = "An API-key environment variable is required when API key is enabled."

        if errors:
            raise ValidationError(errors)


class APIParameter(models.Model):
    """A platform-controlled or caller-supplied upstream API parameter."""

    class Location(models.TextChoices):
        PATH = "path", "Path"
        QUERY = "query", "Query string"
        HEADER = "header", "Header"
        BODY = "body", "JSON body"

    class DataType(models.TextChoices):
        STRING = "string", "String"
        INTEGER = "integer", "Integer"
        NUMBER = "number", "Number"
        BOOLEAN = "boolean", "Boolean"
        ARRAY = "array", "Array"
        OBJECT = "object", "Object"

    configuration = models.ForeignKey(
        APIConfiguration,
        on_delete=models.CASCADE,
        related_name="parameters",
    )
    key = models.CharField(max_length=150)
    upstream_name = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=16, choices=Location.choices, default=Location.QUERY)
    data_type = models.CharField(
        max_length=16,
        choices=DataType.choices,
        default=DataType.STRING,
    )
    description = models.TextField(blank=True)

    required = models.BooleanField(default=False)
    sensitive = models.BooleanField(default=False)
    client_supplied = models.BooleanField(default=True)
    active = models.BooleanField(default=True)

    # ``value`` stores simple configured parameter values such as
    # ``u_type``, ``u_primary``, and ``true``. Keep this as text so existing
    # rows do not require an unsafe PostgreSQL text-to-jsonb cast.
    value = models.TextField(null=True, blank=True)
    default_value = models.JSONField(null=True, blank=True)
    example = models.JSONField(null=True, blank=True)
    validation_schema = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("location", "key")
        verbose_name = "API Parameter"
        verbose_name_plural = "API Parameters"
        constraints = [
            models.UniqueConstraint(
                fields=("configuration", "location", "key"),
                name="unique_api_parameter_location",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.configuration.slug}: {self.location}.{self.key}"

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if self.sensitive and self.value not in (None, "", {}, []):
            errors["value"] = "Sensitive values must use a credential reference."

        if self.client_supplied and self.value not in (None, "", {}, []):
            errors["value"] = "Client-supplied parameters cannot have a fixed value."

        if self.location == self.Location.PATH and not self.upstream_name:
            errors["upstream_name"] = "Path parameters require an upstream name."

        if errors:
            raise ValidationError(errors)


class APIHealthCheck(models.Model):
    """Current operational state for an upstream API configuration."""

    class Status(models.TextChoices):
        UNKNOWN = "unknown", "Unknown"
        HEALTHY = "healthy", "Healthy"
        DEGRADED = "degraded", "Degraded"
        UNHEALTHY = "unhealthy", "Unhealthy"

    configuration = models.OneToOneField(
        APIConfiguration,
        on_delete=models.CASCADE,
        related_name="health_check",
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.UNKNOWN,
    )
    checked_at = models.DateTimeField(null=True, blank=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    upstream_status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    message = models.CharField(max_length=500, blank=True)
    consecutive_failures = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "API Health Check"
        verbose_name_plural = "API Health Checks"

    def __str__(self) -> str:
        return f"{self.configuration}: {self.status}"


# ---------------------------------------------------------------------------
# APIs exposed BY the platform
# ---------------------------------------------------------------------------


class FrontendApplication(TimeStampedModel):
    """A registered application authorized to consume platform APIs."""

    name = models.CharField(max_length=150, unique=True)
    azure_client_id = models.CharField(max_length=255, unique=True)
    allowed_origins = models.JSONField(default=list, blank=True)
    active = models.BooleanField(default=True)

    # Temporary compatibility field. Remove only after all existing consumers
    # have rotated to APIKey records.
    api_key_hash = models.CharField(
        max_length=255,
        blank=True,
        editable=False,
        help_text="Deprecated legacy key hash. Do not use for new consumers.",
    )

    class Meta:
        ordering = ("name",)
        verbose_name = "Frontend Application"
        verbose_name_plural = "Frontend Applications"

    def __str__(self) -> str:
        return self.name


class PublishedEndpoint(UserTrackedModel):
    """A stable, versioned API endpoint exposed by the platform.

    A published endpoint can invoke either an upstream ``APIConfiguration`` or
    a code-owned platform handler selected from an approved registry. A handler
    name is not a Python import path and must be resolved by trusted gateway
    code.
    """

    class AuthenticationMode(models.TextChoices):
        ENTRA = "entra", "Microsoft Entra"
        API_KEY = "api_key", "API key"
        ENTRA_AND_API_KEY = "entra_and_api_key", "Microsoft Entra and API key"

    class TargetType(models.TextChoices):
        CONSUMED_API = "consumed_api", "Consumed API configuration"
        PLATFORM_HANDLER = "platform_handler", "Platform handler"

    public_slug = models.SlugField(max_length=150)
    public_version = models.CharField(max_length=30, default="v1")
    name = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    owner_team = models.CharField(max_length=150, blank=True)
    support_contact = models.EmailField(blank=True)

    target_type = models.CharField(
        max_length=24,
        choices=TargetType.choices,
        default=TargetType.CONSUMED_API,
    )
    configuration = models.ForeignKey(
        APIConfiguration,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="published_endpoints",
    )
    handler_name = models.SlugField(
        max_length=100,
        blank=True,
        help_text="Name from the gateway's code-owned platform handler registry.",
    )

    allowed_methods = models.JSONField(default=list, blank=True)
    authentication_mode = models.CharField(
        max_length=32,
        choices=AuthenticationMode.choices,
        default=AuthenticationMode.ENTRA_AND_API_KEY,
    )
    required_scopes = models.JSONField(default=list, blank=True)

    request_schema = models.JSONField(default=dict, blank=True)
    response_schema = models.JSONField(default=dict, blank=True)

    requests_per_minute = models.PositiveIntegerField(default=60)
    requests_per_day = models.PositiveIntegerField(default=10_000)

    enabled = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    deprecated_at = models.DateTimeField(null=True, blank=True)
    retirement_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("public_version", "public_slug")
        verbose_name = "Published Endpoint"
        verbose_name_plural = "Published Endpoints"
        constraints = [
            models.UniqueConstraint(
                fields=("public_version", "public_slug"),
                name="unique_published_api_route",
            ),
            models.CheckConstraint(
                check=Q(requests_per_minute__gte=1),
                name="published_rpm_positive",
            ),
            models.CheckConstraint(
                check=Q(requests_per_day__gte=1),
                name="published_rpd_positive",
            ),
        ]
        indexes = [
            models.Index(
                fields=("enabled", "public_version", "public_slug"),
                name="published_route_lookup",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.public_version}/{self.public_slug}"

    @property
    def route(self) -> str:
        return f"/api/external/{self.public_version}/{self.public_slug}/"

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if self.target_type == self.TargetType.CONSUMED_API:
            if not self.configuration_id:
                errors["configuration"] = "A consumed API target requires a configuration."
            if self.handler_name:
                errors["handler_name"] = "A consumed API target cannot specify a handler."

        if self.target_type == self.TargetType.PLATFORM_HANDLER:
            if not self.handler_name:
                errors["handler_name"] = "A platform target requires a registered handler name."
            if self.configuration_id:
                errors["configuration"] = "A platform handler target cannot specify a configuration."

        if self.enabled:
            if not self.required_scopes:
                errors["required_scopes"] = "Enabled endpoints require at least one scope."
            if not self.allowed_methods:
                errors["allowed_methods"] = "Enabled endpoints require allowed methods."
            if not self.owner_team.strip():
                errors["owner_team"] = "Enabled endpoints require an owner team."
            if (
                self.configuration_id
                and self.configuration.lifecycle != APIConfiguration.Lifecycle.ACTIVE
            ):
                errors["configuration"] = "Enabled endpoints require an active configuration."

        method_values = {choice for choice, _label in APIConfiguration.Method.choices}
        invalid_methods = {
            str(method).upper()
            for method in (self.allowed_methods or [])
            if str(method).upper() not in method_values
        }
        if invalid_methods:
            errors["allowed_methods"] = (
                "Unsupported methods: " + ", ".join(sorted(invalid_methods))
            )

        if self.deprecated_at and self.retirement_at:
            if self.retirement_at <= self.deprecated_at:
                errors["retirement_at"] = "Retirement must occur after deprecation."

        if errors:
            raise ValidationError(errors)


class APIKey(models.Model):
    """A scoped, expiring credential issued to a consumer application."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        FrontendApplication,
        on_delete=models.CASCADE,
        related_name="api_keys",
    )
    name = models.CharField(max_length=150)
    prefix = models.CharField(max_length=20, unique=True, db_index=True)
    secret_hash = models.CharField(max_length=64, editable=False)
    scopes = models.JSONField(default=list, blank=True)
    allowed_cidrs = models.JSONField(default=list, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_external_api_keys",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    activates_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    last_used_at = models.DateTimeField(null=True, blank=True)
    last_used_ip = models.GenericIPAddressField(null=True, blank=True)

    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="revoked_external_api_keys",
    )
    revocation_reason = models.TextField(blank=True)
    rotated_from = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="replacement_keys",
    )

    class Meta:
        ordering = ("application", "name", "-created_at")
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
        constraints = [
            models.CheckConstraint(
                check=Q(expires_at__gt=F("activates_at")),
                name="api_key_expiry_after_activation",
            ),
        ]
        indexes = [
            models.Index(
                fields=("application", "revoked_at", "expires_at"),
                name="api_key_usable_lookup",
            ),
            models.Index(fields=("expires_at",), name="api_key_expiry_lookup"),
        ]

    def __str__(self) -> str:
        return f"{self.application}: {self.name} ({self.prefix})"

    @property
    def is_usable(self) -> bool:
        now = timezone.now()
        return (
            self.application.active
            and self.revoked_at is None
            and self.activates_at <= now < self.expires_at
        )

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}
        if self.expires_at and self.activates_at and self.expires_at <= self.activates_at:
            errors["expires_at"] = "Expiration must be after activation."
        if self.revoked_at and not self.revocation_reason.strip():
            errors["revocation_reason"] = "A revocation reason is required."
        if errors:
            raise ValidationError(errors)


class EndpointGrant(models.Model):
    """Authorizes one consumer application to call one published endpoint."""

    application = models.ForeignKey(
        FrontendApplication,
        on_delete=models.CASCADE,
        related_name="endpoint_grants",
    )
    endpoint = models.ForeignKey(
        PublishedEndpoint,
        on_delete=models.CASCADE,
        related_name="application_grants",
    )
    scopes = models.JSONField(default=list, blank=True)
    active = models.BooleanField(default=True)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="granted_external_api_access",
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("application", "endpoint")
        verbose_name = "Endpoint Grant"
        verbose_name_plural = "Endpoint Grants"
        constraints = [
            models.UniqueConstraint(
                fields=("application", "endpoint"),
                name="unique_application_endpoint_grant",
            ),
        ]
        indexes = [
            models.Index(
                fields=("application", "active", "expires_at"),
                name="endpoint_grant_lookup",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.application} -> {self.endpoint}"

    @property
    def is_usable(self) -> bool:
        return (
            self.active
            and self.application.active
            and self.endpoint.enabled
            and (self.expires_at is None or self.expires_at > timezone.now())
        )


class IdempotencyRecord(models.Model):
    """Replay protection for a state-changing published platform API."""

    endpoint = models.ForeignKey(
        PublishedEndpoint,
        on_delete=models.CASCADE,
        related_name="idempotency_records",
    )
    application = models.ForeignKey(
        FrontendApplication,
        on_delete=models.CASCADE,
        related_name="idempotency_records",
    )
    key_hash = models.CharField(max_length=64)
    request_hash = models.CharField(max_length=64)
    response_status = models.PositiveSmallIntegerField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Idempotency Record"
        verbose_name_plural = "Idempotency Records"
        constraints = [
            models.UniqueConstraint(
                fields=("endpoint", "application", "key_hash"),
                name="unique_endpoint_idempotency_key",
            ),
        ]
        indexes = [
            models.Index(fields=("expires_at",), name="idempotency_expiry_lookup"),
        ]

    def __str__(self) -> str:
        return f"{self.endpoint} / {self.application} / {self.key_hash[:12]}"


# ---------------------------------------------------------------------------
# Shared observability and governance
# ---------------------------------------------------------------------------


class ConfigurationRevision(models.Model):
    """Immutable, sanitized history for an upstream API configuration."""

    class Event(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        ACTIVATED = "activated", "Activated"
        DISABLED = "disabled", "Disabled"
        DEPRECATED = "deprecated", "Deprecated"
        DELETED = "deleted", "Deleted"

    configuration_id = models.BigIntegerField(db_index=True)
    configuration_slug = models.SlugField(max_length=150)
    configuration_version = models.PositiveIntegerField()
    revision = models.PositiveIntegerField()
    event = models.CharField(max_length=24, choices=Event.choices)

    before = models.JSONField(default=dict, blank=True)
    after = models.JSONField(default=dict, blank=True)
    changed_fields = models.JSONField(default=list, blank=True)
    change_reason = models.TextField()

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="external_api_configuration_revisions",
    )
    correlation_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Configuration Revision"
        verbose_name_plural = "Configuration Revisions"
        constraints = [
            models.UniqueConstraint(
                fields=("configuration_id", "revision"),
                name="unique_api_configuration_revision",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.configuration_slug} r{self.revision}: {self.event}"


class APIRequestAudit(models.Model):
    """Immutable audit row for inbound and outbound gateway activity."""

    class Direction(models.TextChoices):
        INBOUND = "INBOUND", "Inbound"
        OUTBOUND = "OUTBOUND", "Outbound"

    class Status(models.TextChoices):
        SUCCESS = "SUCCESS", "Success"
        CACHE_HIT = "CACHE_HIT", "Cache hit"
        FAILED = "FAILED", "Failed"
        TIMEOUT = "TIMEOUT", "Timeout"
        AUTH_FAILED = "AUTH_FAILED", "Authentication failed"
        API_KEY_FAILED = "API_KEY_FAILED", "API key failed"
        ORIGIN_FAILED = "ORIGIN_FAILED", "Origin failed"
        RATE_LIMITED = "RATE_LIMITED", "Rate limited"
        CONFIGURATION_ERROR = "CONFIGURATION_ERROR", "Configuration error"
        INVALID_RESPONSE = "INVALID_RESPONSE", "Invalid response"

    correlation_id = models.UUIDField(default=uuid.uuid4, db_index=True, editable=False)
    request_id = models.UUIDField(default=uuid.uuid4, db_index=True, editable=False)
    direction = models.CharField(
        max_length=16,
        choices=Direction.choices,
        default=Direction.OUTBOUND,
    )

    api_configuration = models.ForeignKey(
        APIConfiguration,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="audits",
    )
    configuration_version = models.PositiveIntegerField(null=True, blank=True)
    published_endpoint = models.ForeignKey(
        PublishedEndpoint,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audits",
    )

    frontend_application = models.ForeignKey(
        FrontendApplication,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audits",
    )
    api_key = models.ForeignKey(
        APIKey,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audits",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="external_api_audits",
    )

    user_object_id = models.CharField(max_length=255, blank=True)
    user_principal_name = models.CharField(max_length=255, blank=True)
    origin = models.CharField(max_length=500, blank=True)
    client_ip = models.GenericIPAddressField(null=True, blank=True)

    method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=1000, blank=True)
    upstream_host = models.CharField(max_length=255, blank=True)

    status = models.CharField(max_length=40, choices=Status.choices)
    upstream_status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    duration_ms = models.PositiveIntegerField(null=True, blank=True)

    attempt_number = models.PositiveSmallIntegerField(default=1)
    retry_count = models.PositiveSmallIntegerField(default=0)

    request_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    response_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    rate_limit_remaining = models.PositiveIntegerField(null=True, blank=True)
    idempotency_key_hash = models.CharField(max_length=64, blank=True)

    request_parameters = models.JSONField(default=dict, blank=True)

    error_code = models.CharField(max_length=100, blank=True)
    exception_type = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "API Request Audit"
        verbose_name_plural = "API Request Audits"
        indexes = [
            models.Index(
                fields=("frontend_application", "created_at"),
                name="audit_app_created",
            ),
            models.Index(
                fields=("api_configuration", "created_at"),
                name="audit_config_created",
            ),
            models.Index(
                fields=("published_endpoint", "created_at"),
                name="audit_endpoint_created",
            ),
            models.Index(
                fields=("status", "created_at"),
                name="audit_status_created",
            ),
            models.Index(
                fields=("correlation_id", "direction"),
                name="audit_correlation_dir",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.created_at} {self.direction} {self.status}"

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise ValidationError("API request audit records are immutable.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("API request audit records cannot be deleted through the model.")
