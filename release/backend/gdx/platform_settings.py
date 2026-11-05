"""Staff platform settings shown from the sidebar gear icon."""

import json
from pathlib import Path

from django.conf import settings


STORE = Path(settings.BASE_DIR) / "data" / "platform_settings.json"

SECTIONS = (
    {
        "id": "global",
        "label": "Global Settings",
        "description": "License owner information for the marketplace. Stored separately from tenants.",
        "fields": (
            {"name": "organization_name", "label": "Organization name", "type": "text", "default": "Toyota Motor North America"},
            {"name": "team_owner_name", "label": "Team owner name", "type": "text", "default": "Data Marketplace Team"},
            {"name": "app_name", "label": "App name", "type": "text", "default": "GDX Data Marketplace"},
            {"name": "contact_name", "label": "Contact name", "type": "text", "default": ""},
            {"name": "support_email", "label": "Contact email", "type": "email", "default": ""},
            {"name": "phone", "label": "Phone", "type": "text", "default": ""},
            {"name": "industry", "label": "Industry", "type": "text", "default": ""},
            {"name": "address", "label": "Address", "type": "textarea", "default": ""},
            {"name": "license_type", "label": "License type", "type": "select", "default": "Owner", "choices": ("Owner",)},
            {"name": "public_url", "label": "Public site URL", "type": "url", "default": ""},
            {"name": "footer_text", "label": "Footer text", "type": "textarea", "default": "GDX Data Marketplace | Toyota Motor North America. Design & Develop by Data Marketplace Team", "help": "Shown after the year in the site footer."},
        ),
    },
    {
        "id": "platform",
        "label": "Platform Settings",
        "description": "Platform name, admin contact, environment, and catalog page size.",
        "fields": (
            {"name": "marketplace_name", "label": "Platform name", "type": "text", "default": "GDX Data Marketplace"},
            {"name": "admin_email", "label": "Admin email", "type": "email", "default": ""},
            {"name": "support_url", "label": "Support URL", "type": "url", "default": ""},
            {"name": "timezone", "label": "Default timezone", "type": "text", "default": "America/Chicago"},
            {"name": "default_environment", "label": "Default environment", "type": "select", "default": "dev", "choices": ("demo", "dev", "stage", "qa", "prod")},
            {"name": "catalog_page_size", "label": "Catalog page size", "type": "select", "default": "8", "choices": ("8", "16", "24", "36", "48")},
        ),
    },
    {
        "id": "general",
        "label": "General Settings",
        "description": "Language and how dates are displayed.",
        "fields": (
            {"name": "language", "label": "Language", "type": "select", "default": "en", "choices": ("en", "es")},
            {"name": "date_format", "label": "Date format", "type": "select", "default": "MMM D, YYYY", "choices": ("MMM D, YYYY", "YYYY-MM-DD", "MM/DD/YYYY")},
        ),
    },
    {
        "id": "branding",
        "label": "Branding",
        "description": "Logos, brand colors, custom CSS, and the email footer.",
        "fields": (
            {"name": "admin_name", "label": "Administration name", "type": "text", "default": "GDX Administration"},
            {"name": "dark_logo_url", "label": "Dark logo URL", "type": "url", "default": "", "help": "For light backgrounds."},
            {"name": "light_logo_url", "label": "Light logo URL", "type": "url", "default": "", "help": "For dark backgrounds."},
            {"name": "favicon_url", "label": "Favicon URL", "type": "url", "default": ""},
            {"name": "primary_color", "label": "Primary", "type": "color", "default": "#5547ff", "help": "Buttons, links, and active states."},
            {"name": "accent_color", "label": "Accent", "type": "color", "default": "#2fa4a9", "help": "Highlights and emphasis."},
            {"name": "secondary_color", "label": "Secondary", "type": "color", "default": "#e2e0d8", "help": "Subtle surfaces and chips."},
            {"name": "background_color", "label": "Background", "type": "color", "default": "#ffffff", "help": "App canvas color."},
            {"name": "foreground_color", "label": "Foreground", "type": "color", "default": "#243447", "help": "Primary text and ink."},
            {"name": "border_color", "label": "Border", "type": "color", "default": "#e2e0d8", "help": "Dividers and hairlines."},
            {"name": "destructive_color", "label": "Destructive", "type": "color", "default": "#dc2626", "help": "Errors and alerts."},
            {"name": "success_color", "label": "Success", "type": "color", "default": "#16a34a", "help": "Confirmations and OK states."},
            {"name": "custom_css", "label": "Custom CSS", "type": "textarea", "default": "", "help": "Optional CSS overrides."},
            {"name": "email_footer_text", "label": "Email footer text", "type": "text", "default": ""},
        ),
    },
    {
        "id": "security",
        "label": "Security",
        "description": "Authentication and access settings.",
        "fields": (
            {"name": "require_two_factor", "label": "Two-factor authentication", "type": "checkbox", "default": False, "help": "Require 2FA for all admin users."},
            {"name": "session_timeout_minutes", "label": "Session timeout (minutes)", "type": "number", "default": "60", "help": "Auto-logout after inactivity."},
            {"name": "require_verified_staff", "label": "Require verified staff", "type": "checkbox", "default": True, "help": "Staff accounts stay on the not-authorized page until they are verified."},
        ),
    },
    {
        "id": "notifications",
        "label": "Notifications",
        "description": "Alert preferences and delivery channels.",
        "fields": (
            {"name": "notify_new_tenants", "label": "New tenant signups", "type": "checkbox", "default": True, "help": "Get notified when a new organization registers."},
            {"name": "notify_overdue_payments", "label": "Overdue payments", "type": "checkbox", "default": True, "help": "Alert when invoices are past due."},
            {"name": "notify_agreement_expirations", "label": "Agreement expirations", "type": "checkbox", "default": True, "help": "30-day warning before agreements expire."},
            {"name": "notify_module_installations", "label": "Module installations", "type": "checkbox", "default": True, "help": "Notify when tenants add or remove modules."},
            {"name": "notify_security_alerts", "label": "Security alerts", "type": "checkbox", "default": True, "help": "Critical security events and login anomalies."},
            {"name": "notify_usage_thresholds", "label": "Usage thresholds", "type": "checkbox", "default": True, "help": "When tenants approach plan limits."},
            {"name": "email_enabled", "label": "Email", "type": "checkbox", "default": True, "help": "Send alerts by email."},
            {"name": "in_app_enabled", "label": "In-app notifications", "type": "checkbox", "default": True, "help": "Show alerts in the admin dashboard."},
            {"name": "slack_webhook_enabled", "label": "Slack webhook", "type": "checkbox", "default": False, "help": "Send alerts to a Slack channel."},
            {"name": "digest_enabled", "label": "Digest schedule", "type": "checkbox", "default": False, "help": "A digest is sent only when email delivery is on."},
        ),
    },
    {
        "id": "maintenance",
        "label": "Maintenance",
        "description": "When enabled, visitors see the downtime page. Super admins can still use the site.",
        "fields": (
            {"name": "maintenance_mode", "label": "Enable maintenance mode", "type": "checkbox", "default": False, "help": "The site is live when this is off."},
            {"name": "maintenance_headline", "label": "Headline", "type": "text", "default": "We'll be back."},
            {"name": "maintenance_message", "label": "Message", "type": "textarea", "default": "The website is down for maintenance. Check back later."},
        ),
    },
)


def default_values():
    values = {}
    for section in SECTIONS:
        for field in section["fields"]:
            values[field["name"]] = field["default"]
    return values


def load_settings():
    values = default_values()
    try:
        stored = json.loads(STORE.read_text())
    except (OSError, json.JSONDecodeError):
        stored = {}
    if not isinstance(stored, dict):
        stored = {}
    for key in values:
        if key in stored:
            values[key] = stored[key]
    permissions = stored.get("attribute_permissions") or []
    values["attribute_permissions"] = permissions if isinstance(permissions, list) else []
    values["role_permissions"] = _role_permissions(stored.get("role_permissions"))
    from gdx.page_access import page_access_map

    values["page_access"] = page_access_map(stored.get("page_access"))
    values["pending_removals"] = _pending_removals(stored.get("pending_removals"))
    return values


def _pending_removals(stored):
    if not isinstance(stored, list):
        return []
    cleaned = []
    for item in stored:
        if not isinstance(item, dict):
            continue
        kind = item.get("kind")
        key = item.get("key")
        purge_at = item.get("purge_at")
        if kind in ("module", "page") and key and purge_at:
            cleaned.append({
                "kind": kind,
                "key": str(key),
                "purge_at": str(purge_at),
                "deleted_at": str(item.get("deleted_at") or ""),
            })
    return cleaned


def replace_pending_removals(items):
    values = load_settings()
    values["pending_removals"] = items
    _write(values)
    return values


def _role_permissions(stored):
    from apps.profiles.models import ACCESS_CHOICES

    cleaned = {key: [] for key, _label in ACCESS_CHOICES}
    if isinstance(stored, dict):
        for key in cleaned:
            items = stored.get(key) or []
            if isinstance(items, list):
                cleaned[key] = [item for item in items if isinstance(item, str) and item]
    return cleaned


def _write(values):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    STORE.write_text(json.dumps(values, indent=2))


def save_settings(posted, section_id):
    values = load_settings()
    section = next((item for item in SECTIONS if item["id"] == section_id), None)
    if section is None:
        return values
    for field in section["fields"]:
        name = field["name"]
        if field["type"] == "checkbox":
            values[name] = name in posted
        elif name in posted:
            values[name] = posted.get(name)
    _write(values)
    return values


def add_attribute_permission(posted):
    values = load_settings()
    record = {
        "subject": (posted.get("subject") or "").strip(),
        "attribute": (posted.get("attribute") or "").strip(),
        "resource": (posted.get("resource") or "").strip(),
        "action": (posted.get("action") or "").strip(),
        "effect": posted.get("effect") if posted.get("effect") in ("allow", "deny") else "allow",
    }
    if not all((record["subject"], record["attribute"], record["resource"], record["action"])):
        return False
    values["attribute_permissions"].append(record)
    _write(values)
    return True


def grant_role_permission(access_type, permission):
    from apps.profiles.models import ACCESS_CHOICES

    permission = (permission or "").strip()
    allowed = {key for key, _label in ACCESS_CHOICES}
    if access_type not in allowed or "." not in permission:
        return False
    values = load_settings()
    granted = values["role_permissions"][access_type]
    if permission not in granted:
        granted.append(permission)
    _write(values)
    return True


def revoke_role_permission(access_type, permission):
    values = load_settings()
    granted = values["role_permissions"].get(access_type)
    if not granted or permission not in granted:
        return False
    granted.remove(permission)
    _write(values)
    return True


def save_role_page_access(posted):
    from gdx.page_access import ACTION_IDS, PAGES, ROLES

    values = load_settings()
    grants = values["page_access"]
    for page in PAGES:
        page_grants = grants.setdefault(page["id"], {})
        for role in ROLES:
            actions = [action for action in (page_grants.get(role["id"]) or []) if action in ACTION_IDS]
            if role["locked"]:
                page_grants[role["id"]] = list(ACTION_IDS)
                continue
            if f"open_{page['id']}_{role['id']}" in posted:
                if "read" not in actions:
                    actions.append("read")
            else:
                actions = [action for action in actions if action != "read"]
            page_grants[role["id"]] = actions
    values["page_access"] = grants
    _write(values)
    return values


def reset_role_page_access():
    from gdx.page_access import PAGES, ROLES, default_page_access

    values = load_settings()
    defaults = default_page_access()
    grants = values["page_access"]
    for page in PAGES:
        page_grants = grants.setdefault(page["id"], {})
        for role in ROLES:
            actions = [action for action in (page_grants.get(role["id"]) or []) if action != "read"]
            if "read" in defaults[page["id"]][role["id"]]:
                actions.append("read")
            page_grants[role["id"]] = actions
    values["page_access"] = grants
    _write(values)
    return values


def save_page_access(posted):
    from gdx.page_access import ACTION_IDS, PAGES, ROLES

    values = load_settings()
    grants = {}
    for page in PAGES:
        page_grants = {}
        for role in ROLES:
            if role["locked"]:
                page_grants[role["id"]] = list(ACTION_IDS)
                continue
            page_grants[role["id"]] = [
                action for action in ACTION_IDS if f"page_{page['id']}_{role['id']}_{action}" in posted
            ]
        grants[page["id"]] = page_grants
    values["page_access"] = grants
    _write(values)
    return values


def reset_page_access():
    from gdx.page_access import default_page_access

    values = load_settings()
    values["page_access"] = default_page_access()
    _write(values)
    return values


def delete_attribute_permission(index):
    values = load_settings()
    try:
        values["attribute_permissions"].pop(int(index))
    except (ValueError, IndexError):
        return False
    _write(values)
    return True
