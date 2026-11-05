"""Page access for each user access type."""

from apps.profiles.models import (
    ACCESS_ADMIN,
    ACCESS_DEDICATED_MANAGER,
    ACCESS_ENGINEER,
    ACCESS_MODERATOR,
    ACCESS_SUPERADMIN,
    ACCESS_SUPPORT,
    ACCESS_USER,
)


ROLES = (
    {"id": ACCESS_SUPERADMIN, "label": "SuperAdmin", "locked": True},
    {"id": ACCESS_ADMIN, "label": "Admin", "locked": False},
    {"id": ACCESS_MODERATOR, "label": "Moderator", "locked": False},
    {"id": ACCESS_SUPPORT, "label": "Support", "locked": False},
    {"id": ACCESS_ENGINEER, "label": "Engineer", "locked": False},
    {"id": ACCESS_DEDICATED_MANAGER, "label": "Dedicated-Manager", "locked": False},
    {"id": ACCESS_USER, "label": "User", "locked": False},
)

OPERATIONAL_ROLES = (
    ACCESS_MODERATOR,
    ACCESS_SUPPORT,
    ACCESS_ENGINEER,
    ACCESS_DEDICATED_MANAGER,
)
ACTIONS = (
    {"id": "create", "letter": "C", "label": "Create"},
    {"id": "read", "letter": "R", "label": "Read"},
    {"id": "update", "letter": "U", "label": "Update"},
    {"id": "delete", "letter": "7", "label": "Soft delete"},
    {"id": "delete_now", "letter": "I", "label": "Instant"},
)
ACTION_IDS = tuple(action["id"] for action in ACTIONS)

# staff and user mark the default besides SuperAdmin and Admin.
# SuperAdmin is always granted. Admin starts with every page.
PAGES = (
    {"id": "modules_dashboard", "label": "Modules Dashboard", "path": "/sa/integrations", "staff": True},
    {"id": "integration_catalog", "label": "Integration Catalog", "path": "/sa/modules/integrations", "staff": True},
    {"id": "checkout_form_builder", "label": "Checkout Form Builder", "path": "/sa/checkout/form-builder", "staff": True},
    {"id": "dar_form_builder", "label": "DAR Form Builder", "path": "/sa/dar/form-builder", "staff": True},
    {"id": "vikki_learning", "label": "Vikki Learning", "path": "/sa/modules/vikki/learning", "staff": True},
    {"id": "documentation_sites", "label": "Documentation Sites", "path": "/sa/documentation", "staff": True, "user": True},
    {"id": "modules_analytics", "label": "Modules Analytics", "path": "/sa/integrations/analytics", "staff": True},
    {"id": "modules_reports", "label": "Modules Reports", "path": "/sa/integrations/reports", "staff": True},
    {"id": "integration_readiness", "label": "Integration Readiness", "path": "/sa/modules/integrations/readiness", "staff": True},
    {"id": "modules_configuration", "label": "Modules Configuration", "path": "/sa/integrations/configuration", "staff": True},
    {"id": "modules_activity", "label": "Modules Activity", "path": "/sa/integrations/activity", "staff": True},
    {"id": "modules_audit", "label": "Modules Audit", "path": "/sa/integrations/audit", "staff": True},
    {"id": "modules_health", "label": "Modules System Health", "path": "/sa/integrations/health", "staff": True},
    {"id": "modules_dependencies", "label": "Modules Dependencies", "path": "/sa/integrations/dependencies", "staff": True},
    {"id": "modules_documentation", "label": "Modules Documentation", "path": "/sa/integrations/documentation", "staff": True, "user": True},
    {"id": "apify_dashboard", "label": "Apify Dashboard", "path": "/sa/apify/sandbox", "staff": True},
    {"id": "apify_apis", "label": "Apify APIs", "path": "/sa/apify/sandbox/apis", "staff": True},
    {"id": "apify_products", "label": "Apify Products", "path": "/sa/apify/sandbox/products", "staff": True},
    {"id": "apify_policies", "label": "Apify Policies", "path": "/sa/apify/sandbox/policies", "staff": True},
    {"id": "apify_applications", "label": "Apify Applications", "path": "/sa/apify/sandbox/applications", "staff": True},
    {"id": "apify_credentials", "label": "Apify Credentials", "path": "/sa/apify/sandbox/credentials", "staff": False},
    {"id": "apify_access_requests", "label": "Apify Access Requests", "path": "/sa/apify/sandbox/access-requests", "staff": True},
    {"id": "apify_subscriptions", "label": "Apify Subscriptions", "path": "/sa/apify/sandbox/subscriptions", "staff": True},
    {"id": "apify_analytics", "label": "Apify Analytics", "path": "/sa/apify/sandbox/analytics", "staff": True},
    {"id": "apify_audit", "label": "Apify Audit", "path": "/sa/apify/sandbox/audit", "staff": True},
    {"id": "apify_settings", "label": "Apify Settings", "path": "/sa/apify/sandbox/settings", "staff": False},
    {"id": "pages_dashboard", "label": "Pages Dashboard", "path": "/sa/pages", "staff": True},
    {"id": "pages_list", "label": "Pages", "path": "/sa/pages/pages", "staff": True},
    {"id": "page_types", "label": "Page Types", "path": "/sa/pages/page-types", "staff": True},
    {"id": "pages_workflow", "label": "Pages Workflow", "path": "/sa/pages/workflow", "staff": True},
    {"id": "pages_audit", "label": "Pages Audit", "path": "/sa/pages/audit", "staff": True},
    {"id": "pages_notifications", "label": "Pages Notifications", "path": "/sa/pages/notifications", "staff": True},
    {"id": "teams", "label": "Teams", "path": "/sa/teams", "staff": True, "user": True},
    {"id": "aws_catalog", "label": "AWS Catalog", "path": "/sa/modules/aws", "staff": True},
    {"id": "aws_parity", "label": "AWS Environment Parity", "path": "/sa/modules/aws/parity", "staff": True},
    {"id": "changelog_dashboard", "label": "Changelog Dashboard", "path": "/sa/changelog/dashboard", "staff": True, "user": True},
    {"id": "changelog_releases", "label": "Changelog Releases", "path": "/sa/changelog/posts", "staff": True},
    {"id": "changelog_categories", "label": "Changelog Categories", "path": "/sa/changelog/categories", "staff": True},
    {"id": "changelog_compare", "label": "Compare Releases", "path": "/sa/changelog/compare", "staff": True},
    {"id": "changelog_notifications", "label": "Changelog Notifications", "path": "/sa/changelog/notifications", "staff": True},
    {"id": "changelog_audit", "label": "Changelog Audit", "path": "/sa/changelog/audit", "staff": True},
    {"id": "dar_forms", "label": "DAR Forms", "path": "/sa/dar/forms/definitions", "staff": True},
    {"id": "dar_submissions", "label": "DAR Submissions", "path": "/sa/dar/forms/submissions", "staff": True},
    {"id": "dar_analytics", "label": "DAR Analytics", "path": "/sa/dar/forms/analytics", "staff": True},
    {"id": "dar_audit", "label": "DAR Audit", "path": "/sa/dar/forms/audit", "staff": True},
    {"id": "dar_routing", "label": "DAR Routing Rules", "path": "/sa/dar/forms/routing", "staff": True},
    {"id": "dar_rules", "label": "DAR Rule Groups", "path": "/sa/dar/forms/rules", "staff": True},
    {"id": "dar_validation", "label": "DAR Validation Rules", "path": "/sa/dar/forms/validation", "staff": True},
    {"id": "notifications_inbox", "label": "Notification Inbox", "path": "/sa/notifications", "staff": True, "user": True},
    {"id": "notifications_preferences", "label": "Notification Preferences", "path": "/sa/notifications/preferences", "staff": True},
    {"id": "notifications_campaigns", "label": "Notification Campaigns", "path": "/sa/notifications/campaigns", "staff": True},
    {"id": "notifications_rules", "label": "Notification Rules", "path": "/sa/notifications/rules", "staff": True},
    {"id": "orders_dashboard", "label": "Orders Dashboard", "path": "/sa/orders/dashboard", "staff": True},
    {"id": "orders", "label": "Orders", "path": "/sa/orders/orders", "staff": True},
    {"id": "orders_analytics", "label": "Orders Analytics", "path": "/sa/orders/analytics", "staff": True},
    {"id": "orders_track", "label": "Track Order", "path": "/sa/orders/track", "staff": True, "user": True},
    {"id": "workflow_dashboard", "label": "Workflow Command Center", "path": "/sa/workflow/dashboard", "staff": True},
    {"id": "workflow_library", "label": "Workflow Library", "path": "/sa/workflow/workflows", "staff": True},
    {"id": "workflow_builder", "label": "Workflow Builder", "path": "/sa/workflow/workflows/new", "staff": True},
    {"id": "workflow_runs", "label": "Workflow Runs", "path": "/sa/workflow/runs", "staff": True},
    {"id": "workflow_audit", "label": "Workflow Audit", "path": "/sa/workflow/audit", "staff": True},
    {"id": "deployment_dashboard", "label": "Deployment Dashboard", "path": "/sa/deployment", "staff": True},
    {"id": "deployment_analytics", "label": "Deployment Analytics", "path": "/sa/deployment/analytics", "staff": True},
    {"id": "deployment_activity", "label": "Deployment Activity", "path": "/sa/deployment/activity", "staff": True},
    {"id": "deployment_releases", "label": "Deployment Releases", "path": "/sa/deployment/releases", "staff": True},
    {"id": "deployment_rollback", "label": "Deployment Rollback", "path": "/sa/deployment/rollback", "staff": True},
    {"id": "deployment_health", "label": "Deployment Health", "path": "/sa/deployment/health", "staff": True},
    {"id": "settings", "label": "Settings", "path": "/sa/settings", "staff": False},
)


def _clean(path):
    if path != "/" and path.endswith("/"):
        return path[:-1]
    return path


def _all_actions():
    return list(ACTION_IDS)


def _actions_for(page, role_id):
    if role_id in (ACCESS_SUPERADMIN, ACCESS_ADMIN):
        return _all_actions()
    if role_id in OPERATIONAL_ROLES and page.get("staff", True):
        return [action for action in ACTION_IDS if action != "delete_now"]
    if role_id == ACCESS_USER and page.get("user"):
        return ["read"]
    return []


def default_page_access():
    grants = {}
    for page in PAGES:
        grants[page["id"]] = {role["id"]: _actions_for(page, role["id"]) for role in ROLES}
    return grants


def _clean_actions(actions):
    if not isinstance(actions, list):
        return []
    return [action for action in ACTION_IDS if action in actions]


def page_access_map(stored):
    defaults = default_page_access()
    if not isinstance(stored, dict):
        return defaults
    role_ids = {role["id"] for role in ROLES}
    cleaned = {}
    for page in PAGES:
        raw = stored.get(page["id"])
        page_grants = {role["id"]: [] for role in ROLES}
        page_grants[ACCESS_SUPERADMIN] = _all_actions()
        if isinstance(raw, list):
            for role_id in raw:
                if role_id in role_ids:
                    page_grants[role_id] = _all_actions()
        elif isinstance(raw, dict):
            for role in ROLES:
                if role["locked"]:
                    continue
                if role["id"] in raw:
                    page_grants[role["id"]] = _clean_actions(raw.get(role["id"]))
                else:
                    page_grants[role["id"]] = list(defaults[page["id"]][role["id"]])
        else:
            page_grants = {role_id: list(actions) for role_id, actions in defaults[page["id"]].items()}
        cleaned[page["id"]] = page_grants
    return cleaned


def page_rows(grants):
    rows = []
    for page in PAGES:
        granted = grants.get(page["id"], {})
        rows.append({
            "id": page["id"],
            "label": page["label"],
            "path": page["path"],
            "cells": [
                {
                    "id": role["id"],
                    "label": role["label"],
                    "locked": role["locked"],
                    "actions": [
                        {
                            "id": action["id"],
                            "letter": action["letter"],
                            "label": action["label"],
                            "checked": role["locked"] or action["id"] in granted.get(role["id"], ()),
                        }
                        for action in ACTIONS
                    ],
                }
                for role in ROLES
            ],
        })
    return rows


def match_page(path):
    current = _clean(path or "/")
    best = None
    best_length = -1
    for page in PAGES:
        prefix = _clean(page["path"])
        if current == prefix or current.startswith(prefix + "/"):
            if len(prefix) > best_length:
                best = page
                best_length = len(prefix)
    return best


def _required_action(method):
    method = (method or "GET").upper()
    if method in ("GET", "HEAD", "OPTIONS"):
        return "read"
    if method == "DELETE":
        return "delete"
    return "write"


def access_allows(grants, access_type, path, method="GET"):
    page = match_page(path)
    if page is None or access_type == ACCESS_SUPERADMIN:
        return True
    actions = grants.get(page["id"], {}).get(access_type, ())
    required = _required_action(method)
    if required == "delete":
        return "delete" in actions or "delete_now" in actions
    if required == "write":
        return "create" in actions or "update" in actions
    return "read" in actions


def granted_actions(user, path):
    if user is None or not getattr(user, "is_authenticated", False):
        return set()
    if getattr(user, "is_superuser", False) or access_type_for_safe(user) == ACCESS_SUPERADMIN:
        return set(ACTION_IDS)
    page = match_page(path)
    if page is None:
        return set(ACTION_IDS)
    from gdx.platform_settings import load_settings

    grants = load_settings().get("page_access") or default_page_access()
    return set(grants.get(page["id"], {}).get(access_type_for_safe(user), ()))


def access_type_for_safe(user):
    from apps.profiles.models import access_type_for

    return access_type_for(user)


class PageAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated or user.is_superuser or match_page(request.path) is None:
            return self.get_response(request)
        from apps.profiles.models import access_type_for
        from gdx.platform_settings import load_settings

        grants = load_settings().get("page_access") or default_page_access()
        if access_allows(grants, access_type_for(user), request.path, request.method):
            return self.get_response(request)
        from django.shortcuts import redirect

        return redirect("not_authorized")
