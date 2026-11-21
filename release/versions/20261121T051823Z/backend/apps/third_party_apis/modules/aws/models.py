from django.db import models

from .choices import AwsEnvironment, AwsResourceType


class AwsEnvironmentConfig(models.Model):
    environment = models.CharField(max_length=16, choices=AwsEnvironment.choices, unique=True)
    account_alias = models.CharField(max_length=128, blank=True)
    account_id = models.CharField(max_length=12, blank=True)
    region = models.CharField(max_length=32, default="us-east-1")
    role_arn = models.CharField(max_length=512, blank=True)
    enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("environment",)

    def __str__(self):
        return self.get_environment_display()


class AwsResourceConfig(models.Model):
    environment = models.ForeignKey(
        AwsEnvironmentConfig,
        on_delete=models.CASCADE,
        related_name="resources",
    )
    resource_type = models.CharField(max_length=32, choices=AwsResourceType.choices)
    name = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=32, blank=True)
    enabled = models.BooleanField(default=False)
    settings = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("resource_type", "name")
        constraints = [
            models.UniqueConstraint(
                fields=("environment", "resource_type", "name"),
                name="uq_aws_env_resource_name",
            )
        ]

    def __str__(self):
        suffix = f" - {self.name}" if self.name else ""
        return f"{self.environment} / {self.get_resource_type_display()}{suffix}"
