import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    status = models.CharField(max_length=20, default="active")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class EnterpriseTeam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, related_name="teams")
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default="active")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "slug"], name="uniq_team_tenant_slug"
            )
        ]

    def __str__(self):
        return f"{self.tenant}: {self.name}"

class TenantMembership(models.Model):
    ROLES = [
        (x, x)
        for x in [
            "platform_admin",
            "tenant_admin",
            "api_owner",
            "product_owner",
            "approver",
            "developer",
            "auditor",
            "viewer",
        ]
    ]
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenant_memberships",
    )
    role = models.CharField(max_length=32, choices=ROLES)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["tenant", "user"], name="uniq_tenant_user")
        ]

class TeamMembership(models.Model):
    ROLES = [(x, x) for x in ["owner", "manager", "developer", "approver", "viewer"]]
    team = models.ForeignKey(EnterpriseTeam, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="team_memberships",)
    role = models.CharField(max_length=20, choices=ROLES)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["team", "user"], name="uniq_team_user")
        ]

    def clean(self):
        if not TenantMembership.objects.filter(
            tenant=self.team.tenant, user=self.user, is_active=True
        ).exists():
            raise ValidationError("Active tenant membership required.")


class ApplicationAccessGroup(models.Model):
    class Purpose(models.TextChoices):
        APP_ACCESS = "app_access", "Application access"
        PLATFORM_OWNER = "platform_owner", "Platform owner"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    purpose = models.CharField(max_length=32, choices=Purpose.choices)
    external_object_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ApplicationAccessGroupMembership(models.Model):
    class Source(models.TextChoices):
        SCIM = "scim", "SCIM"
        ENTRA_TOKEN = "entra_token", "Entra token claim"
        MANUAL = "manual", "Manual"

    group = models.ForeignKey(ApplicationAccessGroup, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="apify_access_group_memberships",)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.SCIM)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "user"], name="uniq_apify_group_user"
            )
        ]


class PlatformOwnership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.OneToOneField(EnterpriseTeam, on_delete=models.PROTECT, related_name="platform_ownership")
    owner_group = models.ForeignKey(ApplicationAccessGroup, on_delete=models.PROTECT, related_name="platform_ownerships",)
    is_active = models.BooleanField(default=True)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(owner_group__isnull=False),
                name="platform_owner_group_required",
            )
        ]

    def clean(self):
        if (
            self.owner_group_id
            and self.owner_group.purpose
            != ApplicationAccessGroup.Purpose.PLATFORM_OWNER
        ):
            raise ValidationError("Owner group must have platform_owner purpose.")
