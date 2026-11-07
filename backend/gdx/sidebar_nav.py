"""Staff sidebar built from the registered pages and their real routes."""

from gdx.page_access import PAGES


DASHBOARD_LABELS = {
    "command_center": "Command Center Dashboard",
    "command_center_analytics": "Command Center Analytics",
    "command_center_my_dashboards": "My Dashboards",
    "modules_dashboard": "Integrations Dashboard",
    "modules_analytics": "Integrations Analytics",
    "apify_dashboard": "Apify Dashboard",
    "apify_analytics": "Apify Analytics",
    "pages_dashboard": "Pages Dashboard",
    "changelog_dashboard": "Changelog Dashboard",
    "dar_analytics": "Data Access Analytics",
    "orders_dashboard": "Orders Dashboard",
    "orders_analytics": "Orders Analytics",
    "workflow_dashboard": "Workflow Dashboard",
    "deployment_dashboard": "Deployment Dashboard",
    "deployment_analytics": "Deployment Analytics",
    "microsoft_teams": "Microsoft Teams Dashboard",
    "microsoft_email": "Microsoft Email Dashboard",
    "google_analytics": "Google Analytics Dashboard",
}

BY_ID = {page["id"]: page for page in PAGES}


def _link(page_id, label=None, icon=""):
    page = BY_ID[page_id]
    item = {"label": label or page["label"], "href": page["path"]}
    if icon:
        item["icon"] = icon
    return item


def _path(label, href):
    return {"label": label, "href": href}


def _group(label, icon, children):
    return {"label": label, "icon": icon, "children": [item for item in children if item]}


def _pages(*page_ids):
    return [_link(page_id) for page_id in page_ids if page_id in BY_ID and page_id not in DASHBOARD_LABELS]


def _workflow_pages():
    """Landing pages from the workflow URL modules, not detail or action routes."""
    return [
        _link("workflow_dashboard", "Dashboard"),
        _path("Library", "/sa/workflow/workflows/"),
        _path("Builder", "/sa/workflow/workflows/new/"),
        _path("Runs", "/sa/workflow/runs/"),
        _path("Audit", "/sa/workflow/audit/"),
        _path("Forms", "/sa/workflow/forms/form-list/"),
        _path("Form Builder", "/sa/workflow/forms/form-builder/"),
        _path("Rules", "/sa/workflow/rules/rule-list/"),
        _path("Rule Builder", "/sa/workflow/rules/rule-builder/"),
        _path("Inbox", "/sa/workflow/inbox/"),
        _path("Walkthrough", "/sa/workflow/walkthrough/"),
        _path("Marketplace", "/sa/workflow/marketplace/"),
        _path("Certification", "/sa/workflow/marketplace/certification/"),
        _path("Connectors", "/sa/workflow/connectors/"),
        _path("Connector Health", "/sa/workflow/connectors/health/"),
        _path("Agents", "/sa/workflow/agents/"),
        _path("Governance", "/sa/workflow/governance/"),
        _path("Governance Overview", "/sa/workflow/governance/dashboard/"),
        _path("Operations", "/sa/workflow/operations/"),
        _path("Operations Center", "/sa/workflow/operations/dashboard/"),
        _path("Observability", "/sa/workflow/observability/"),
        _path("Reliability Overview", "/sa/workflow/observability/dashboard/"),
        _path("Simulation", "/sa/workflow/simulation/"),
        _path("Workflow GPS", "/sa/workflow/analytics/workflow-gps/"),
        _path("Workflow Genome", "/sa/workflow/analytics/workflow-genome/"),
        _path("Vikki", "/sa/workflow/vikki/"),
        _path("Developer", "/sa/workflow/developer/"),
        _path("Portal", "/sa/workflow/portal/"),
        _path("Workflow Settings", "/sa/workflow/settings/"),
    ]


def _mark(path, nodes):
    current = (path or "/").rstrip("/") or "/"
    for node in nodes:
        href = (node.get("href") or "").rstrip("/") or ""
        node["current"] = bool(href) and href == current
        children = node.get("children") or []
        if children:
            _mark(path, children)
            node["open"] = any(child.get("open") or child.get("current") for child in children)
        else:
            node["open"] = False
    return nodes


def sidebar_sections(request):
    """Sections and links for the staff sidebar."""
    sections = [
        {
            "title": "Command Center",
            "items": [
                _group("Command Center", "isax-command", [
                    _link("command_center", "Dashboard"),
                    _link("command_center_analytics", "Analytics"),
                    _link("command_center_my_dashboards", "My Dashboards"),
                    _link("command_center_my_reports", "My Reports"),
                    _link("command_center_reports", "Reports"),
                    _link("command_center_health", "Health"),
                    _path("Create", "/sa/command-center/create/"),
                ]),
            ],
        },
        {
            "title": "Marketplace",
            "items": [
                _group("Catalog", "isax-box", [
                    _path("Dashboard", "/sa/marketplace/admin/dashboard/"),
                    _path("Analytics", "/sa/marketplace/admin/analytics/"),
                    _path("Domain Dashboard", "/sa/marketplace/admin/domains/dashboard/"),
                    _path("Domain Analytics", "/sa/marketplace/admin/domains/analytics/"),
                    _path("Products", "/sa/marketplace/admin/products/"),
                    _path("Approvals", "/sa/marketplace/admin/approvals/"),
                    _path("Reviews", "/sa/marketplace/admin/reviews/"),
                    _link("checkout_form_builder", "Checkout"),
                    _path("Taxonomy", "/sa/marketplace/admin/taxonomy/"),
                    _path("Domains", "/sa/marketplace/admin/domains/"),
                    _path("Subdomains", "/sa/marketplace/admin/subdomains/"),
                    _path("Search", "/sa/marketplace/admin/search/"),
                    _path("Governance", "/sa/marketplace/admin/governance/"),
                    _path("People", "/sa/marketplace/admin/people/"),
                    _path("References", "/sa/marketplace/admin/reference/"),
                    _path("Exports", "/sa/marketplace/admin/exports/"),
                ]),
                _group("Orders", "isax-menu-board", [
                    _link("orders_dashboard", "Dashboard"),
                    _link("orders_analytics", "Analytics"),
                    _link("orders", "Orders"),
                    _link("orders_track", "Track Order"),
                    _path("Audit", "/sa/orders/audit/"),
                    _path("Sync Health", "/sa/orders/sync-health/"),
                ]),
                _group("Data Access", "isax-document-text-1", [
                    _path("Dashboard", "/sa/dar/forms/"),
                    _link("dar_analytics", "Analytics"),
                    _link("dar_form_builder", "Form Builder"),
                    *_pages("dar_forms", "dar_submissions", "dar_audit", "dar_routing", "dar_rules", "dar_validation"),
                    _path("Project Codes", "/sa/dar/forms/lookups/project-codes/"),
                    _path("Company Holidays", "/sa/dar/forms/lookups/company-holidays/"),
                    _path("System Health", "/sa/dar/forms/health/"),
                ]),
                _group("Pages", "isax-document", [
                    _link("pages_dashboard", "Dashboard"),
                    *_pages("pages_list", "page_types", "pages_workflow", "pages_audit", "pages_notifications"),
                    _path("New Page", "/sa/pages/pages/new/"),
                    _path("New Page Type", "/sa/pages/page-types/new/"),
                ]),
            ],
        },
        {
            "title": "Work",
            "items": [
                _group("Notifications", "isax-notification", [
                    _path("Analytics", "/sa/notifications/master/advanced-analytics/"),
                    *_pages("notifications_inbox", "notifications_preferences", "notifications_campaigns", "notifications_rules"),
                    _path("Unread", "/sa/notifications/unread/"),
                    _path("Templates", "/sa/notifications/templates/"),
                    _path("Audiences", "/sa/notifications/audiences/"),
                    _path("Deliveries", "/sa/notifications/deliveries/"),
                    _path("Operations", "/sa/notifications/operations/"),
                ]),
                _group("Teams", "isax-people", [
                    _link("teams", "Teams"),
                    _path("New Team", "/sa/teams/new/"),
                ]),
                _group("Workflow", "isax-hierarchy-square-3", _workflow_pages()),
            ],
        },
        {
            "title": "Platform",
            "items": [
                _group("Integrations", "isax-cpu", [
                    _link("modules_dashboard", "Dashboard"),
                    _link("modules_analytics", "Analytics"),
                    _link("microsoft_email", "Microsoft Email"),
                    _link("microsoft_teams", "Microsoft Teams"),
                    _link("google_analytics", "Google Analytics"),
                    _link("integration_catalog", "Catalog"),
                    *_pages(
                        "integration_readiness",
                        "modules_reports",
                        "modules_configuration",
                        "modules_activity",
                        "modules_audit",
                        "modules_health",
                        "modules_dependencies",
                        "modules_documentation",
                        "vikki_learning",
                    ),
                    _group("Apify", "isax-code", [
                        _link("apify_dashboard", "Dashboard"),
                        _link("apify_analytics", "Analytics"),
                        *_pages(
                        "apify_apis",
                        "apify_products",
                        "apify_policies",
                        "apify_applications",
                        "apify_credentials",
                        "apify_access_requests",
                        "apify_subscriptions",
                        "apify_audit",
                        "apify_settings",
                    )]),
                    _group("AWS", "isax-cloud", _pages("aws_catalog", "aws_parity")),
                ]),
                _group("Deployment", "isax-send-2", [
                    _link("deployment_dashboard", "Dashboard"),
                    _link("deployment_analytics", "Analytics"),
                    *_pages(
                    "deployment_activity",
                    "deployment_releases",
                    "deployment_rollback",
                    "deployment_health",
                )]),
                _group("Changelog", "isax-clock", [
                    _link("changelog_dashboard", "Dashboard"),
                    *_pages("changelog_releases", "changelog_categories", "changelog_compare", "changelog_notifications", "changelog_audit"),
                    _path("Timeline", "/sa/changelog/timeline/"),
                    _path("New Release", "/sa/changelog/posts/create/"),
                    _path("New Category", "/sa/changelog/categories/create/"),
                ]),
            ],
        },
        {
            "title": "System",
            "items": [
                _link("settings", "Settings", "isax-setting-25"),
                _link("documentation_sites", "Documentation", "isax-document-normal4"),
            ],
        },
    ]
    for section in sections:
        _mark(getattr(request, "path", ""), section["items"])
    return sections
