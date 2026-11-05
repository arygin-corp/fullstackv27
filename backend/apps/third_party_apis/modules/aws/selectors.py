from .choices import (
    AwsEnvironment,
    AwsResourceType,
    parity_status,
    resource_category,
    service_summary,
)
from .models import AwsEnvironmentConfig, AwsResourceConfig


def ensure_environment_configs():
    rows = []
    for value, _label in AwsEnvironment.choices:
        obj, _ = AwsEnvironmentConfig.objects.get_or_create(environment=value)
        rows.append(obj)
    return rows


def environment_config(environment):
    ensure_environment_configs()
    return AwsEnvironmentConfig.objects.get(environment=environment)


def environment_resources(environment):
    return AwsResourceConfig.objects.filter(environment__environment=environment).select_related("environment")


def resource_groups(environment):
    """Group one environment's resources by catalog category."""
    groups = {}
    for resource in environment_resources(environment):
        groups.setdefault(resource_category(resource.resource_type), []).append(resource)
    return groups


def parity_matrix(environments):
    """Compare every catalog resource type across the five AWS environments."""
    rows = []
    for value, label in AwsResourceType.choices:
        cells = []
        for environment in environments:
            configured = AwsResourceConfig.objects.filter(
                environment=environment,
                resource_type=value,
            )
            status, explanation = parity_status(
                configured.count(),
                configured.filter(enabled=True).count(),
            )
            cells.append({
                "status": status,
                "explanation": explanation,
                "environment": environment,
            })
        rows.append({
            "resource_type": value,
            "label": label,
            "category": resource_category(value),
            "cells": cells,
            "aligned": all(cell["status"] == "ok" for cell in cells),
        })
    return rows


def adapter_inventory():
    """Return registered AWS adapters and the resource types that have none."""
    from .services.registry import AWS_SERVICE_REGISTRY

    adapters = []
    for key, adapter in sorted(AWS_SERVICE_REGISTRY.all().items()):
        instance = adapter() if isinstance(adapter, type) else adapter
        result = instance.health_check()
        adapters.append({
            "key": instance.service_key,
            "operations": sorted(instance.supported_operations),
            "status": result.status,
            "message": result.message,
        })
    adapted = {row["key"] for row in adapters}
    uncovered = [
        {"key": value, "label": label, "category": resource_category(value)}
        for value, label in AwsResourceType.choices
        if value not in adapted
    ]
    return adapters, uncovered


def environment_health(environments):
    rows = []
    for environment in environments:
        resources = environment.resources.all()
        issues = []
        if not environment.enabled:
            issues.append("Environment disabled")
        if not environment.account_id:
            issues.append("Account ID not set")
        if not environment.region:
            issues.append("Region not set")
        if not environment.role_arn:
            issues.append("Role ARN not set")
        rows.append({
            "environment": environment,
            "resource_count": resources.count(),
            "enabled_resource_count": resources.filter(enabled=True).count(),
            "role_configured": bool(environment.role_arn),
            "issues": issues,
        })
    return rows


def connectable_services(environment_row):
    """Services this environment can connect, grouped so cards flow by category."""
    adapters, _uncovered = adapter_inventory()
    by_key = {row["key"]: row for row in adapters}
    counts = {}
    for resource in environment_row.resources.all():
        bucket = counts.setdefault(resource.resource_type, {"configured": 0, "enabled": 0})
        bucket["configured"] += 1
        if resource.enabled:
            bucket["enabled"] += 1
    grouped = {}
    for value, label in AwsResourceType.choices:
        adapter = by_key.get(value)
        usage = counts.get(value, {})
        grouped.setdefault(resource_category(value), []).append({
            "key": value,
            "label": label,
            "summary": service_summary(value),
            "operations": adapter["operations"] if adapter else [],
            "adapter": adapter is not None,
            "configured": usage.get("configured", 0),
            "enabled": usage.get("enabled", 0),
        })
    return [
        {"category": category, "services": services}
        for category, services in grouped.items()
    ]


def recent_changes(limit=40):
    """Catalog edits recorded on environment and resource rows."""
    events = []
    for environment in AwsEnvironmentConfig.objects.all():
        events.append({
            "updated_at": environment.updated_at,
            "kind": "Environment",
            "name": environment.get_environment_display(),
            "detail": environment.region or "Region not set",
            "enabled": environment.enabled,
        })
    for resource in AwsResourceConfig.objects.select_related("environment"):
        events.append({
            "updated_at": resource.updated_at,
            "kind": "Resource",
            "name": resource.name or resource.get_resource_type_display(),
            "detail": (
                f"{resource.environment.get_environment_display()} · "
                f"{resource.get_resource_type_display()}"
            ),
            "enabled": resource.enabled,
        })
    events.sort(key=lambda event: event["updated_at"], reverse=True)
    return events[:limit]
