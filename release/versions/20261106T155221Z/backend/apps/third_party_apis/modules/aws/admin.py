from django.contrib import admin

from .models import AwsEnvironmentConfig, AwsResourceConfig


@admin.register(AwsEnvironmentConfig)
class AwsEnvironmentConfigAdmin(admin.ModelAdmin):
    list_display = ("environment", "account_alias", "account_id", "region", "enabled", "updated_at")
    list_filter = ("environment", "enabled", "region")
    search_fields = ("account_alias", "account_id", "role_arn")


@admin.register(AwsResourceConfig)
class AwsResourceConfigAdmin(admin.ModelAdmin):
    list_display = ("resource_type", "name", "environment", "region", "enabled", "updated_at")
    list_filter = ("environment", "resource_type", "enabled", "region")
    search_fields = ("name",)
