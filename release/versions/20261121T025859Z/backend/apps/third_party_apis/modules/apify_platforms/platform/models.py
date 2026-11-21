import uuid
from django.conf import settings
from django.db import models
from apps.teams.models import Team
from apps.teams.models import Tenant

class TO(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey("tenancy.Tenant", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Api(TO):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=True, blank=True)
    owner_team = models.ForeignKey(Team, on_delete=models.PROTECT, null=True, blank=True)
    enterprise_owner = models.ForeignKey("tenancy.EnterpriseTeam", null=True, blank=True, on_delete=models.PROTECT, related_name="owned_catalog_apis")
    module_key = models.SlugField(max_length=80, unique=True, null=True, blank=True)
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    summary = models.TextField(blank=True)
    base_url = models.CharField(max_length=500, blank=True)
    authentication = models.CharField(max_length=160, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    protocol = models.CharField(max_length=20, default="rest")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "slug"], name="uniq_api_tenant_slug"
            )
        ]


class ApiVersion(TO):
    api = models.ForeignKey(Api, on_delete=models.CASCADE, related_name="versions")
    version = models.CharField(max_length=40)
    specification = models.JSONField(default=dict)


class ApiEndpoint(TO):
    version = models.ForeignKey(
        ApiVersion, on_delete=models.CASCADE, related_name="endpoints"
    )
    name = models.CharField(max_length=160, blank=True)
    method = models.CharField(max_length=12)
    path = models.CharField(max_length=500)
    required_scope = models.CharField(max_length=160, blank=True)


class ApiProduct(TO):
    api = models.ForeignKey(Api, null=True, blank=True, on_delete=models.CASCADE, related_name="products")
    owner_team = models.ForeignKey("tenancy.EnterpriseTeam", on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    endpoints = models.ManyToManyField(ApiEndpoint)
    scopes = models.JSONField(default=list)
    quota_per_minute = models.PositiveIntegerField(default=60)
    published = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "slug"], name="uniq_product_tenant_slug"
            )
        ]


class ApiProxy(TO):
    api = models.ForeignKey(Api, on_delete=models.PROTECT, related_name="proxies")
    name = models.CharField(max_length=160)
    base_path = models.CharField(max_length=255)
    target_url = models.URLField(max_length=500)
    status = models.CharField(max_length=20, default="draft")


class ProxyRevision(TO):
    proxy = models.ForeignKey(
        ApiProxy, on_delete=models.CASCADE, related_name="revisions"
    )
    revision = models.PositiveIntegerField()
    configuration = models.JSONField(default=dict)
    checksum = models.CharField(max_length=128, blank=True)

class RuntimeEnvironment(TO):
    name = models.CharField(max_length=80)
    slug = models.SlugField()
    gateway_adapter = models.CharField(max_length=80, default="mock")
    configuration = models.JSONField(default=dict)
    is_production = models.BooleanField(default=False)

class ProxyDeployment(TO):
    revision = models.ForeignKey(ProxyRevision, on_delete=models.PROTECT)
    environment = models.ForeignKey(RuntimeEnvironment, on_delete=models.PROTECT)
    status = models.CharField(max_length=32, default="pending")
    deployed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    external_reference = models.CharField(max_length=255, blank=True)

class PolicyDefinition(TO):
    name = models.CharField(max_length=160)
    policy_type = models.CharField(max_length=40)
    configuration = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, default="draft")

class PolicyAttachment(TO):
    policy = models.ForeignKey(PolicyDefinition, on_delete=models.PROTECT)
    proxy = models.ForeignKey(ApiProxy, on_delete=models.CASCADE)
    environment = models.ForeignKey(RuntimeEnvironment, null=True, blank=True, on_delete=models.PROTECT)
    flow_stage = models.CharField(max_length=32, default="request")
    execution_order = models.PositiveIntegerField(default=100)
    condition = models.TextField(blank=True)

class ClientApplication(TO):
    owner_team = models.ForeignKey("tenancy.EnterpriseTeam", on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    owners = models.ManyToManyField(settings.AUTH_USER_MODEL)
    status = models.CharField(max_length=20, default="active")

class ApiAccessRequest(TO):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    application = models.ForeignKey(ClientApplication, null=True, blank=True, on_delete=models.PROTECT)
    product = models.ForeignKey(ApiProduct, on_delete=models.PROTECT)
    requesting_team = models.ForeignKey("tenancy.EnterpriseTeam", on_delete=models.PROTECT)
    grantee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="catalog_access_requests")
    environment = models.ForeignKey(RuntimeEnvironment, null=True, blank=True, on_delete=models.PROTECT)
    scopes = models.JSONField(default=list)
    justification = models.TextField()
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.SUBMITTED)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="catalog_reviews")
    reviewed_at = models.DateTimeField(null=True, blank=True)

class ApiSubscription(TO):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        REVOKED = "revoked", "Revoked"

    request = models.OneToOneField(ApiAccessRequest, on_delete=models.PROTECT)
    application = models.ForeignKey(ClientApplication, null=True, blank=True, on_delete=models.PROTECT)
    product = models.ForeignKey(ApiProduct, on_delete=models.PROTECT)
    consumer_team = models.ForeignKey("tenancy.EnterpriseTeam", on_delete=models.PROTECT)
    grantee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="catalog_subscriptions")
    environment = models.ForeignKey(RuntimeEnvironment, on_delete=models.PROTECT)
    scopes = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="catalog_approvals")
    expires_at = models.DateTimeField(null=True, blank=True)

class ClientCredential(TO):
    application = models.ForeignKey(ClientApplication, on_delete=models.PROTECT)
    subscription = models.ForeignKey(ApiSubscription, on_delete=models.PROTECT)
    credential_type = models.CharField(max_length=32)
    client_id = models.CharField(max_length=128, unique=True)
    secret_hash = models.CharField(max_length=255, blank=True)
    secret_reference = models.CharField(max_length=500, blank=True)
    fingerprint = models.CharField(max_length=64)
    status = models.CharField(max_length=32, default="active")
    issued_at = models.DateTimeField()
    expires_at = models.DateTimeField()

class PortalPublication(TO):
    class Visibility(models.TextChoices):
        INTERNAL = "internal", "Internal"
        RESTRICTED = "restricted", "Restricted"

    product = models.ForeignKey(ApiProduct, on_delete=models.PROTECT)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.INTERNAL)
    allowed_teams = models.ManyToManyField("tenancy.EnterpriseTeam", blank=True, related_name="restricted_publications")
    documentation = models.TextField(blank=True)
    code_samples = models.JSONField(default=list)
    status = models.CharField(max_length=20, default="draft")

class DeveloperOrganization(TO):
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    members = models.ManyToManyField(settings.AUTH_USER_MODEL)

class RatePlan(TO):
    product = models.ForeignKey(ApiProduct, on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    billing_model = models.CharField(max_length=32, default="chargeback")
    currency = models.CharField(max_length=3, default="USD")
    fixed_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=6, default=0)

class UsageRecord(TO):
    subscription = models.ForeignKey(ApiSubscription, on_delete=models.PROTECT)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    request_count = models.PositiveBigIntegerField(default=0)
    error_count = models.PositiveBigIntegerField(default=0)
    billable_amount = models.DecimalField(max_digits=14, decimal_places=4, default=0)

class ApiMetric(TO):
    proxy = models.ForeignKey(ApiProxy, on_delete=models.CASCADE)
    environment = models.ForeignKey(RuntimeEnvironment, on_delete=models.PROTECT)
    bucket_start = models.DateTimeField()
    request_count = models.PositiveBigIntegerField(default=0)
    error_count = models.PositiveBigIntegerField(default=0)
    p50 = models.FloatField(default=0)
    p95 = models.FloatField(default=0)
    p99 = models.FloatField(default=0)

class SecurityFinding(TO):
    proxy = models.ForeignKey(ApiProxy, null=True, on_delete=models.CASCADE)
    finding_type = models.CharField(max_length=80)
    severity = models.CharField(max_length=20)
    status = models.CharField(max_length=20, default="open")
    evidence = models.JSONField(default=dict)
    recommendation = models.TextField(blank=True)

class ThreatEvent(TO):
    proxy = models.ForeignKey(ApiProxy, on_delete=models.CASCADE)
    environment = models.ForeignKey(RuntimeEnvironment, on_delete=models.PROTECT)
    event_type = models.CharField(max_length=80)
    severity = models.CharField(max_length=20)
    details = models.JSONField(default=dict)

class EventApi(TO):
    owner_team = models.ForeignKey("tenancy.EnterpriseTeam", on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    protocol = models.CharField(max_length=32, default="kafka")
    asyncapi = models.JSONField(default=dict)

class EventSubscription(TO):
    event_api = models.ForeignKey(EventApi, on_delete=models.PROTECT)
    application = models.ForeignKey(ClientApplication, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, default="active")
    filters = models.JSONField(default=dict)

class RepositoryIntegration(TO):
    name = models.CharField(max_length=160)
    provider = models.CharField(max_length=40)
    repository_url = models.URLField(max_length=500)
    default_branch = models.CharField(max_length=160, default="main")
    secret_reference = models.CharField(max_length=500, blank=True)

class Pipeline(TO):
    name = models.CharField(max_length=160)
    repository = models.ForeignKey(RepositoryIntegration, on_delete=models.PROTECT)
    configuration = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default="active")

class PipelineRun(TO):
    pipeline = models.ForeignKey(Pipeline, on_delete=models.PROTECT)
    commit_sha = models.CharField(max_length=64)
    status = models.CharField(max_length=20, default="queued")
    results = models.JSONField(default=dict)

class GovernanceProfile(TO):
    api = models.OneToOneField(Api, on_delete=models.CASCADE)
    classification = models.CharField(max_length=40, default="internal")
    contains_pii = models.BooleanField(default=False)
    contains_pci = models.BooleanField(default=False)
    retention_policy = models.CharField(max_length=160, blank=True)
    steward = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT)
    lineage = models.JSONField(default=dict)
    data_contract = models.JSONField(default=dict)


class AiRecommendation(TO):
    target_type = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    recommendation_type = models.CharField(max_length=80)
    content = models.JSONField(default=dict)
    confidence = models.FloatField(null=True)
    status = models.CharField(max_length=20, default="proposed")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT)

class OutboxEvent(TO):
    topic = models.CharField(max_length=120)
    aggregate_type = models.CharField(max_length=100)
    aggregate_id = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    idempotency_key = models.CharField(max_length=160, unique=True)
    status = models.CharField(max_length=20, default="pending")
    attempts = models.PositiveIntegerField(default=0)
    available_at = models.DateTimeField()
    last_error = models.TextField(blank=True)
