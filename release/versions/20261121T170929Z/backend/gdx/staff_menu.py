"""Staff sidebar visibility from Django auth groups."""

SUPER = "Super Administrator Group"
ADMIN = "Administrator Group"
CONTENT = "Content Manager Group"
WEB = "Web Publishers Group"
SECURITY = "Data Security Group"
OWNERS = "Product Team/Owner Group"
REVIEW = "Data Review Board Group"
LEGAL = "Legal Group"
VIP = "VIP Group"

# An empty group set stays available to every signed-in staff user.
SECTIONS = {
    "dashboard": frozenset(),
    "apps": frozenset({ADMIN}),
    "marketplace": frozenset({CONTENT, WEB, OWNERS, REVIEW, SECURITY, ADMIN}),
    "notifications": frozenset({CONTENT, ADMIN}),
    "orders": frozenset({OWNERS, SECURITY, ADMIN}),
    "teams": frozenset({OWNERS, REVIEW, ADMIN}),
    "changelog": frozenset({WEB, CONTENT, ADMIN}),
    "pages": frozenset({WEB, LEGAL, ADMIN}),
    "email": frozenset({ADMIN}),
    "utilities": frozenset({ADMIN}),
    "settings": frozenset({ADMIN}),
    "help": frozenset({CONTENT, WEB, LEGAL, ADMIN}),
    "guide": frozenset(),
}

# Longest prefixes first so subdomains-level-2 is not treated as subdomains.
PATHS = (
    ("/marketplace/notifications", "notifications"),
    ("/marketplace/requests", "orders"),
    ("/marketplace/tasks", "orders"),
    ("/marketplace/subdomains-level-2", "marketplace"),
    ("/marketplace/data-stewards", "marketplace"),
    ("/marketplace/one-ts-domains", "marketplace"),
    ("/marketplace/classifications", "marketplace"),
    ("/marketplace/domains", "marketplace"),
    ("/marketplace/subdomains", "marketplace"),
    ("/marketplace/products", "marketplace"),
    ("/marketplace/reviews", "marketplace"),
    ("/marketplace/badges", "marketplace"),
    ("/marketplace/keywords", "marketplace"),
    ("/marketplace/datatypes", "marketplace"),
    ("/marketplace/platforms", "marketplace"),
    ("/marketplace/contacts", "marketplace"),
    ("/marketplace/catalogs", "marketplace"),
    ("/sa/teams", "teams"),
    ("/changelog/categories", "changelog"),
    ("/changelog/posts", "changelog"),
)


def _names(user):
    if not getattr(user, "is_authenticated", False):
        return set()
    return set(user.groups.values_list("name", flat=True))


def allowed_sections(user):
    if not getattr(user, "is_authenticated", False):
        return set()
    names = _names(user)
    if getattr(user, "is_superuser", False) or SUPER in names:
        return set(SECTIONS)
    if VIP in names:
        return {"dashboard"}
    return {key for key, groups in SECTIONS.items() if not groups or names & groups}


def section_for_path(path):
    current = (path or "/").split("?", 1)[0]
    if len(current) > 1 and current.endswith("/"):
        current = current[:-1]
    for prefix, section in PATHS:
        if current == prefix or current.startswith(prefix + "/"):
            return section
    return None


class StaffMenuMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        section = section_for_path(request.path)
        if section and user is not None and getattr(user, "is_authenticated", False):
            if section not in allowed_sections(user):
                from django.shortcuts import redirect

                return redirect("not_authorized")
        return self.get_response(request)
