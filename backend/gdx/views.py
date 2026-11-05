import hashlib
import logging
import os

from allauth.account.views import PasswordChangeView, PasswordSetView
from django.conf import settings
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import default_storage
from django.db import DatabaseError, transaction
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.http import url_has_allowed_host_and_scheme
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .forms import (
    GDXAuthenticationForm,
    GDXRegistrationForm,
    LockScreenForm,
)


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------------

def _safe_next_url(request, candidate):
    """
    Return candidate when it is a safe local redirect.

    This prevents an attacker from supplying an external URL through the
    `next` query-string parameter.
    """
    if candidate and url_has_allowed_host_and_scheme(
        url=candidate,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return candidate

    return settings.LOGIN_REDIRECT_URL

# ---------------------------------------------------------------------------
# General views
# ---------------------------------------------------------------------------

class HomeView(LoginRequiredMixin, View):
    def get(self, request):
        context = {
            "heading": "Dashboard",
            "heading2": "Home",
            "pageview": "Marketplace",
        }
        return render(request, "gdx_users/apps/pages/pages/home.html", context)


class ChangelogView(LoginRequiredMixin, View):
    def get(self, request):
        context = {
            "heading": "Data Marketplace Changelog",
            "pageview": "Marketplace",
        }
        return render(
            request,
            "marketplace/changelog/dm/changelog.html",
            context,
        )


class DocsView(LoginRequiredMixin, View):
    def get(self, request):
        context = {
            "heading": "Documentation",
            "pageview": "GDX CMS Portal",
        }
        return render(request, "@cms/apps/docs/docs.html", context)


# ---------------------------------------------------------------------------
# Static authentication page views
# ---------------------------------------------------------------------------

class PagesLoginView(View):
    def get(self, request):
        return render(request, "account/login.html")


class PagesRegisterView(View):
    def get(self, request):
        return render(request, "account/register.html")


class PagesRecoverView(View):
    def get(self, request):
        return render(
            request,
            "authentication/auth-recoverpw.html",
        )


class PagesLockscreenView(View):
    def get(self, request):
        return render(
            request,
            "authentication/auth-lock-screen.html",
        )


class PagesConfirmMailView(View):
    def get(self, request):
        return render(
            request,
            "authentication/auth-confirm-mail.html",
        )


class PagesEmailVerificationView(View):
    def get(self, request):
        return render(
            request,
            "authentication/auth-email-verification-mail.html",
        )


class PagesTwoStepVerificationView(View):
    def get(self, request):
        return render(
            request,
            "authentication/auth-two-step-verification-mail.html",
        )


# ---------------------------------------------------------------------------
# Password management
# ---------------------------------------------------------------------------

class MyPasswordChangeView(LoginRequiredMixin, PasswordChangeView):
    success_url = reverse_lazy("home")


class MyPasswordSetView(LoginRequiredMixin, PasswordSetView):
    success_url = reverse_lazy("home")


# ---------------------------------------------------------------------------
# Local Django authentication
# ---------------------------------------------------------------------------

def not_authorized(request):
    user = request.user
    pending_verification = False
    if getattr(user, "is_authenticated", False) and getattr(user, "is_staff", False) and not getattr(user, "is_superuser", False):
        try:
            pending_verification = not user.profile.is_verified
        except ObjectDoesNotExist:
            pending_verification = True
    return render(
        request,
        "gdx_admin/auth/not_authorized.html",
        {"pending_verification": pending_verification},
    )


class GDXLoginView(LoginView):
    template_name = "gdx_admin/auth/login.html"
    authentication_form = GDXAuthenticationForm
    redirect_authenticated_user = True

    def form_valid(self, form):
        response = super().form_valid(form)

        if not self.request.POST.get("remember_me"):
            self.request.session.set_expiry(0)

        return response


def register(request):
    if request.user.is_authenticated:
        return redirect(settings.LOGIN_REDIRECT_URL)

    form = GDXRegistrationForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(
            request,
            user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        return redirect(settings.LOGIN_REDIRECT_URL)

    return render(
        request,
        "gdx_admin/auth/register.html",
        {"form": form},
    )


@login_required
def lock_screen(request):
    form = LockScreenForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = authenticate(
            request=request,
            username=request.user.get_username(),
            password=form.cleaned_data["password"],
        )

        if user is not None:
            login(
                request,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )

            next_url = _safe_next_url(
                request,
                request.GET.get("next"),
            )
            return redirect(next_url)

        form.add_error(
            "password",
            "The password is incorrect.",
        )

    return render(
        request,
        "gdx_admin/auth/lock_screen.html",
        {"form": form},
    )


# ---------------------------------------------------------------------------
# Microsoft Entra ID authentication
# ---------------------------------------------------------------------------



# ---------------------------------------------------------------------------
# CKEditor upload
# ---------------------------------------------------------------------------

@csrf_exempt
@staff_member_required
def custom_ckeditor5_upload(request):
    """
    Handle uploads from CKEditor 5.

    Access is restricted to authenticated staff members.
    """
    if request.method != "POST":
        return JsonResponse(
            {
                "error": {
                    "message": "Only POST requests are allowed.",
                }
            },
            status=405,
        )

    uploaded_file = request.FILES.get("upload")

    if not uploaded_file:
        return JsonResponse(
            {
                "error": {
                    "message": "No file was uploaded.",
                }
            },
            status=400,
        )

    safe_filename = os.path.basename(uploaded_file.name)
    upload_path = os.path.join(
        "ckeditor5_uploads",
        safe_filename,
    )

    try:
        file_path = default_storage.save(
            upload_path,
            uploaded_file,
        )
        file_url = default_storage.url(file_path)
    except Exception:
        logger.exception("CKEditor file upload failed.")
        return JsonResponse(
            {
                "error": {
                    "message": "The file could not be uploaded.",
                }
            },
            status=500,
        )

    return JsonResponse({"url": file_url})


def apify_environment_redirect(request, environment, rest=""):
    """Sandbox, test, and prod share one catalog. The environment is stored on the session."""
    request.session["apify_environment"] = environment
    path = "/sa/apify/sandbox/" + rest
    if request.META.get("QUERY_STRING"):
        path = f"{path}?{request.META['QUERY_STRING']}"
    return redirect(path)


@require_POST
@login_required
def set_header_environment(request):
    from gdx.context_processors import HEADER_ENVIRONMENTS

    selected = request.POST.get("environment", "")
    if selected in dict(HEADER_ENVIRONMENTS):
        request.session["gdx_environment"] = selected
    next_url = request.POST.get("next") or "/"
    if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        next_url = "/"
    return redirect(next_url)