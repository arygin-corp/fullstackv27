"""Route visitors to the maintenance page while maintenance mode is on."""

from django.shortcuts import redirect

from .platform_settings import load_settings


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
        if _is_exempt(request.path) or not load_settings().get("maintenance_mode"):
            return self.get_response(request)
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated and user.is_superuser:
            return self.get_response(request)
        return redirect("maintenance")
