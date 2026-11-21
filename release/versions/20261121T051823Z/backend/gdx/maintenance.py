"""Route visitors to the maintenance page while maintenance mode is on."""

import os
from datetime import datetime, timedelta, timezone

from django.shortcuts import redirect

from .platform_settings import load_settings

WINDOWS = {
    "Deployment build (1 hour)": (1, "deploy", "Deployment build"),
    "Bug fix · Quick fix (1 hour)": (1, "quick", "Quick Fix"),
    "Bug fix · Low complexity (2 hours)": (2, "low", "Low Complexity"),
    "Bug fix · Medium complexity (3 hours)": (3, "medium", "Medium Complexity"),
    "Bug fix · High complexity (5 hours)": (5, "high", "High Complexity"),
}
DEPLOYMENT = "Deployment build (1 hour)"


def maintenance_env_on():
    return os.getenv("MAINTENANCE_MODE", "").strip().lower() in {"1", "true", "yes", "on"}


def _surface():
    return str(load_settings().get("maintenance_surface") or "")


def maintenance_is_on():
    """Django admin is down for a backend deploy, a combined deploy, or a manual window."""
    if maintenance_env_on():
        return True
    if not load_settings().get("maintenance_mode"):
        return False
    return _surface() in ("", "backend", "both")


def frontend_maintenance_is_on():
    """The Angular app is down for a frontend deploy, a combined deploy, or a manual window."""
    if maintenance_env_on():
        return True
    if not load_settings().get("maintenance_mode"):
        return False
    return _surface() in ("", "frontend", "both")


def maintenance_context(request=None):
    stored = load_settings()
    choice = DEPLOYMENT if maintenance_env_on() else (stored.get("maintenance_work") or DEPLOYMENT)
    clock_on = maintenance_is_on() or frontend_maintenance_is_on()
    if request is not None and not clock_on:
        preview = request.GET.get("work")
        if preview in WINDOWS:
            choice = preview
    hours, tone, kind = WINDOWS.get(choice, (1, "deploy", "Deployment build"))
    started = _started_at(stored.get("maintenance_started_at"))
    if clock_on:
        if started is None:
            from .platform_settings import ensure_maintenance_started

            started = _started_at(ensure_maintenance_started())
    else:
        started = datetime.now(timezone.utc)
    ends = started + timedelta(hours=hours)
    return {
        "maintenance_kind": kind,
        "maintenance_tone": tone,
        "maintenance_hours": hours,
        "maintenance_ends_at": int(ends.timestamp() * 1000),
    }


def frontend_status():
    """Public status the Angular app reads while a frontend or combined deploy is running."""
    from django.conf import settings

    context = maintenance_context()
    stored = load_settings()
    version = str(getattr(settings, "APP_DISPLAY_VERSION", "") or "")
    tone = context["maintenance_tone"]
    label = f"Deploying {version}".strip() if tone == "deploy" else context["maintenance_kind"]
    return {
        "active": frontend_maintenance_is_on(),
        "tone": tone,
        "label": label,
        "endsAt": context["maintenance_ends_at"],
        "headline": stored.get("maintenance_headline") or "We'll be back.",
        "message": stored.get("maintenance_message") or "The website is down for maintenance. Check back later.",
    }


def _started_at(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


EXEMPT_PREFIXES = (
    "/maintenance",
    "/login",
    "/logout",
    "/register",
    "/lock-screen",
    "/password-reset",
    "/reset/",
    "/microsoft_authentication/",
    "/account/",
    "/accounts/",
    "/static/",
    "/media/",
    "/api/",
    "/admin/login",
    "/admin/logout",
)


def _is_exempt(path):
    for prefix in EXEMPT_PREFIXES:
        root = prefix.rstrip("/")
        if path == root or path.startswith(root + "/"):
            return True
    return False


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if _is_exempt(request.path) or not maintenance_is_on():
            return self.get_response(request)
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated and user.is_superuser:
            return self.get_response(request)
        return redirect("maintenance")
