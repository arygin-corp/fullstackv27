"""Canonical serialization for the third-party integration catalog."""

from django.conf import settings as django_settings
from django.templatetags.static import static
from django.urls import NoReverseMatch, reverse

from .catalog_management import composite_management_metadata
from .models import InstalledThirdPartyApi
from .module_pages import module_page_links
from .operational_status import ModuleOperationalStatus
from .registry import registry


def integration_catalog():
    """Return every registered integration as canonical catalog JSON."""
    registry.autodiscover()

    database_rows = {
        row.module_key: row
        for row in (
            InstalledThirdPartyApi.objects
            .prefetch_related(
                "audit_logs",
                "test_runs",
            )
            .all()
        )
    }

    results = [
        _serialize_registered_module(
            module=module,
            row=database_rows.get(module.key),
        )
        for module in registry.all()
    ]

    return sorted(
        results,
        key=lambda item: (item.get("name") or "").lower(),
    )


def serialize_integration(row):
    """Serialize one installed integration."""
    registry.autodiscover()

    module = registry.get(row.module_key)

    return _serialize_registered_module(
        module=module,
        row=row,
    )


def serialize_registered_integration(module):
    """Serialize one registered module with or without a database record."""
    row = (
        InstalledThirdPartyApi.objects
        .filter(module_key=module.key)
        .prefetch_related(
            "audit_logs",
            "test_runs",
        )
        .first()
    )

    return _serialize_registered_module(
        module=module,
        row=row,
    )


def _serialize_registered_module(module, row=None):
    """Build the complete canonical representation for one module."""
    configuration = _configuration_metadata(module)

    payload = {
        # Identity
        "module_key": module.key,
        "name": _database_or_module_value(
            row=row,
            row_attribute="name",
            module=module,
            module_attributes=(
                "display_name",
                "name",
            ),
            default=module.key,
        ),
        "description": _database_or_module_value(
            row=row,
            row_attribute="description",
            module=module,
            module_attributes=(
                "description",
            ),
        ),
        "source_name": _database_or_module_value(
            row=row,
            row_attribute="source_name",
            module=module,
            module_attributes=(
                "default_source_name",
                "source_name",
            ),
        ),
        "icon_url": _icon_url(
            module=module,
            row=row,
        ),

        # Installation state
        "enabled": bool(row.enabled) if row else False,
        "state_url": _reverse_optional(
            "third_party_api:integration_state_api",
            module_key=module.key,
        ) if row else None,
        "manage_url": _reverse_optional(
            "third_party_api:integration_manage_api",
            module_key=module.key,
        ) if row else None,
        "test_run_url": _reverse_optional(
            "third_party_api:integration_test_run",
            module_key=module.key,
        ) if row else None,

        # Discovery
        "tags": _list_metadata(module, "tags"),
        "capabilities": _list_metadata(
            module,
            "capabilities",
        ),
        "environments": _list_metadata(
            module,
            "environments",
        ),

        # Governance
        "owner": _first_string_metadata(
            module,
            "owner",
            "owner_group",
        ),
        "support_group": _string_metadata(
            module,
            "support_group",
        ),
        "version": _string_metadata(
            module,
            "version",
        ),
        "documentation_url": _string_metadata(
            module,
            "documentation_url",
        ),

        # Interfaces
        "frontend": _frontend_metadata(module),
        "upstream": _upstream_metadata(module),
        "endpoints": _endpoint_metadata(module),

        # Configuration
        "configuration": configuration,
        "settings": configuration["settings"],

        # Runtime
        "last_success_at": (
            row.last_success_at
            if row is not None
            else None
        ),
        "last_failure_at": _last_failure_at(row),
        "health": _health_metadata(row),

        # Module-specific UI
        "presentation": _presentation_metadata(module),
        "pages": module_page_links(module.key),
    }

    payload.update(
        composite_management_metadata(module)
    )

    return payload


def _database_or_module_value(
    *,
    row,
    row_attribute,
    module,
    module_attributes,
    default="",
):
    """Prefer a populated database value over module metadata."""
    if row is not None:
        database_value = getattr(
            row,
            row_attribute,
            None,
        )

        if database_value not in (None, ""):
            return database_value

    for attribute in module_attributes:
        module_value = getattr(
            module,
            attribute,
            None,
        )

        if module_value not in (None, ""):
            return module_value

    return default


def _frontend_metadata(module):
    """Normalize the existing flat frontend interface metadata."""
    endpoint = ""

    public_endpoint = getattr(
        module,
        "public_endpoint",
        None,
    )

    if callable(public_endpoint):
        try:
            endpoint = public_endpoint() or ""
        except (AttributeError, TypeError, ValueError):
            endpoint = ""

    return {
        "endpoint": endpoint,
        "method": (
            getattr(
                module,
                "frontend_method",
                "",
            )
            or ""
        ),
        "authentication": (
            getattr(
                module,
                "frontend_authentication",
                "",
            )
            or ""
        ),
    }


def _upstream_metadata(module):
    """Normalize provider information and configured endpoint state."""
    endpoint_setting = (
        getattr(
            module,
            "upstream_endpoint_setting",
            "",
        )
        or ""
    )

    endpoint = (
        getattr(
            django_settings,
            endpoint_setting,
            "",
        )
        if endpoint_setting
        else ""
    )

    return {
        "provider": (
            getattr(
                module,
                "upstream_provider",
                "",
            )
            or ""
        ),
        "method": (
            getattr(
                module,
                "upstream_method",
                "",
            )
            or ""
        ),
        "authentication": (
            getattr(
                module,
                "upstream_authentication",
                "",
            )
            or ""
        ),
        "endpoint_setting": endpoint_setting,
        "endpoint": endpoint or "",
        "endpoint_configured": bool(endpoint),
    }


def _configuration_metadata(module):
    operational = ModuleOperationalStatus(module)

    items = operational.settings()

    missing_required = list(
        operational.missing_required()
    )

    return {
        "status": (
            "ready"
            if not missing_required
            else "incomplete"
        ),

        "settings": [
            {
                "name": item.name,
                "category": item.category,
                "configured": item.configured,
                "secret": item.secret,
            }
            for item in items
        ],

        "missing_required": missing_required,

        "unconfigured_optional": list(
            operational.unconfigured_optional()
        ),

        "cache": [
            {
                "name": name,
                "status": status,
            }
            for name, status
            in operational.cache_status()
        ],
    }


def _endpoint_metadata(module):
    """Return the module's optional multi-endpoint inventory."""
    endpoints = getattr(
        module,
        "endpoints",
        (),
    ) or ()

    output = []

    for endpoint in endpoints:
        if not isinstance(endpoint, dict):
            continue

        output.append({
            "name": str(
                endpoint.get("name", "")
            ),
            "route_name": str(
                endpoint.get("route_name", "")
            ),
            "method": str(
                endpoint.get("method", "")
            ),
            "authentication": str(
                endpoint.get(
                    "authentication",
                    "",
                )
            ),
            "parameters": list(
                endpoint.get("parameters", ())
                or ()
            ),
        })

    return output


def _presentation_metadata(module):
    """Return a safe presentation declaration."""
    presentation = getattr(
        module,
        "presentation",
        None,
    ) or {}

    card = dict(
        presentation.get("card", {}) or {}
    )
    settings = dict(
        presentation.get("settings", {}) or {}
    )
    documentation = dict(
        presentation.get(
            "documentation",
            {},
        ) or {}
    )

    return {
        "card": {
            "fields": _safe_card_fields(
                card.get("fields", ())
            ),
        },
        "settings": {
            "sections": list(
                settings.get("sections", ())
                or ()
            ),
        },
        "documentation": {
            "sections": list(
                documentation.get(
                    "sections",
                    (),
                )
                or ()
            ),
        },
    }


def _safe_card_fields(fields):
    """Allow only supported card formats and safe metadata paths."""
    supported_formats = {
        "text",
        "code",
        "number",
        "datetime",
        "status",
        "boolean",
    }

    output = []

    for field in fields or ():
        if not isinstance(field, dict):
            continue

        label = str(field.get("label", "")).strip()
        source = str(field.get("source", "")).strip()
        value_format = str(
            field.get("format", "text")
        )

        if not label or not source:
            continue

        if value_format not in supported_formats:
            value_format = "text"

        output.append({
            "label": label,
            "source": source,
            "format": value_format,
            "hide_if_empty": bool(
                field.get(
                    "hide_if_empty",
                    True,
                )
            ),
        })

    return output


def _last_failure_at(row):
    """Derive the most recent failure from the integration audit log."""
    if row is None:
        return None

    failure = (
        row.audit_logs
        .filter(result__iexact="FAILURE")
        .order_by("-created_at")
        .only("created_at")
        .first()
    )

    return failure.created_at if failure else None


def _health_metadata(row):
    """Build health metadata from the most recent readiness test run."""
    if row is None:
        return {
            "status": "unknown",
            "last_checked_at": None,
        }

    latest = (
        row.test_runs
        .order_by("-started_at")
        .first()
    )

    if latest is None:
        return {
            "status": "not_tested",
            "last_checked_at": None,
        }

    return {
        "status": latest.status,
        "last_checked_at": (
            latest.completed_at
            or latest.started_at
        ),
    }


def _string_metadata(module, attribute):
    value = getattr(
        module,
        attribute,
        "",
    )

    return str(value or "")


def _first_string_metadata(module, *attributes):
    for attribute in attributes:
        value = getattr(
            module,
            attribute,
            None,
        )

        if value not in (None, ""):
            return str(value)

    return ""


def _list_metadata(module, attribute):
    value = getattr(
        module,
        attribute,
        (),
    ) or ()

    if isinstance(value, str):
        return [value]

    try:
        return list(value)
    except TypeError:
        return []


def _reverse_optional(route_name, **kwargs):
    try:
        return reverse(
            route_name,
            kwargs=kwargs or None,
        )
    except NoReverseMatch:
        return None


def _icon_url(module, row=None):
    """Prefer a database-uploaded icon, then the static module icon."""
    if row is not None:
        icon = getattr(
            row,
            "icon_image",
            None,
        )

        if icon:
            return icon.url

    icon_path = getattr(
        module,
        "icon_path",
        "",
    )

    return static(icon_path) if icon_path else ""