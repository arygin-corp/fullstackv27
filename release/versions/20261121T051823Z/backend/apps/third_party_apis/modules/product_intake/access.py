from django.conf import settings

CONTENT_MANAGER_GROUP = "Content Manager Group"
ADMINSITRATOR_GROUP = "Adminsitrator Group"
SUPER_ADMINISTRATOR_GROUP = "Super Administrator Group"
WORKFLOW_GROUPS = {
    CONTENT_MANAGER_GROUP,
    ADMINSITRATOR_GROUP,
    SUPER_ADMINISTRATOR_GROUP,
}
PROTECTED_GROUPS = WORKFLOW_GROUPS


def normalized_email(value):
    return (value or "").strip().casefold()


def is_active_authenticated(user):
    return bool(user and user.is_authenticated and user.is_active)


def in_group(user, *names):
    groups = getattr(user, "groups", None)
    return bool(
        is_active_authenticated(user)
        and groups is not None
        and groups.filter(name__in=names).exists()
    )


def can_manage_workflow(user):
    return in_group(user, *WORKFLOW_GROUPS)


def can_approve_or_reject(user):
    return can_manage_workflow(user)


def can_activate_product(user):
    return can_manage_workflow(user)


def can_view_audit(user):
    return in_group(user, SUPER_ADMINISTRATOR_GROUP)


def can_manage_protected_membership(user):
    email = normalized_email(getattr(user, "email", ""))
    allowlist = {
        normalized_email(item)
        for item in getattr(settings, "INTAKE_MEMBERSHIP_MANAGER_EMAILS", set())
    }
    return bool(is_active_authenticated(user) and email and email in allowlist)
