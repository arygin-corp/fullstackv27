from django.contrib.auth import logout, get_user_model
from django.contrib import messages
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import redirect

User = get_user_model()

EXEMPT_PREFIXES = (
    "/not-authorized",
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
    "/maintenance",
)


def user_is_verified_staff(user):
    """Signed-in users may continue only after a super admin verifies their profile."""
    if not getattr(user, "is_authenticated", False) or getattr(user, "is_superuser", False):
        return True
    try:
        profile = user.profile
    except ObjectDoesNotExist:
        return False
    return bool(getattr(profile, "is_verified", False))


def _is_exempt(path):
    for prefix in EXEMPT_PREFIXES:
        root = prefix.rstrip("/")
        if path == root or path.startswith(root + "/"):
            return True
    return False


class VerifiedStaffAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if _is_exempt(request.path):
            return self.get_response(request)
        user = getattr(request, "user", None)
        if user is not None and not user_is_verified_staff(user):
            return redirect("not_authorized")
        return self.get_response(request)

class MicrosoftEmailValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only check authenticated users
        if request.user.is_authenticated:
            email = request.user.email

            # Check if the user exists in our pre-approved system
            # We filter by email and check if the record actually exists in our DB
            user_exists = User.objects.filter(email__iexact=email).exists()

            if not user_exists:
                messages.error(request,
                               f"The account {email} is not authorized to access this system. Please contact an administrator.")
                logout(request)
                return redirect('login')

        response = self.get_response(request)
        return response