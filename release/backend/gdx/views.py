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

from .documentation import documentation_asset, documentation_hub
from .platform_settings import (
    SECTIONS,
    add_attribute_permission,
    grant_role_permission,
    revoke_role_permission,
    delete_attribute_permission,
    load_settings,
    reset_page_access,
    reset_role_page_access,
    save_page_access,
    save_role_page_access,
    save_settings,
)
from .forms import (
    GDXAuthenticationForm,
    GDXRegistrationForm,
    LockScreenForm,
)


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------------

def home_for(user):
    """SuperAdmin opens the staff site. Every other account opens the marketplace."""
    from apps.profiles.models import ACCESS_SUPERADMIN, access_type_for

    if access_type_for(user) == ACCESS_SUPERADMIN:
        return "/sa/command-center/"
    return "/marketplace/"


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
        return redirect(home_for(request.user))


@login_required
def staff_home(request):
    from apps.profiles.models import ACCESS_SUPERADMIN, access_type_for

    if access_type_for(request.user) != ACCESS_SUPERADMIN:
        return redirect("/marketplace/")
    return redirect("command_center:dashboard")


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
    template_name = "gdx_users/apps/account/login.html"
    authentication_form = GDXAuthenticationForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return self.get_redirect_url() or home_for(self.request.user)

    def form_valid(self, form):
        response = super().form_valid(form)

        if not self.request.POST.get("remember_me"):
            self.request.session.set_expiry(0)

        return response


def register(request):
    if request.user.is_authenticated:
        return redirect(home_for(request.user))

    form = GDXRegistrationForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(
            request,
            user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        return redirect(home_for(user))

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


def maintenance(request):
    return render(request, "gdx_admin/auth/maintenance.html")


def _settings_redirect(tab, request=None):
    from urllib.parse import urlencode

    query = {"tab": tab}
    if request is not None and tab == "users":
        for key in ("q", "access", "verified", "page"):
            value = (request.POST.get(key) or "").strip()
            if value:
                query[key] = value
    return redirect(f"{reverse('platform_settings')}?{urlencode(query)}")


@staff_member_required
def platform_settings(request):
    from django.contrib.auth.models import Group

    if request.method == "POST":
        action = request.POST.get("action", "save_settings")
        tab = request.POST.get("tab") or request.POST.get("settings_section") or "global"
        if action == "save_settings":
            save_settings(request.POST, request.POST.get("settings_section"))
            messages.success(request, "Settings saved.")
        elif action == "create_user":
            _create_user(request)
        elif action == "set_verified":
            _set_verified(request)
        elif action == "create_group":
            _create_group(request)
        elif action == "assign_group":
            _assign_group(request)
        elif action == "grant_permission":
            _grant_permission(request)
        elif action == "revoke_permission":
            _revoke_permission(request)
        elif action == "save_role_page_access":
            save_role_page_access(request.POST)
            messages.success(request, "Role-based page access saved.")
        elif action == "reset_role_page_access":
            reset_role_page_access()
            messages.success(request, "Role-based page access reset to defaults.")
        elif action == "save_page_access":
            save_page_access(request.POST)
            messages.success(request, "Role-based page access saved.")
        elif action == "reset_page_access":
            reset_page_access()
            messages.success(request, "Role-based page access reset to defaults.")
        elif action == "grant_role_permission":
            _grant_role_permission(request)
        elif action == "revoke_role_permission":
            _revoke_role_permission(request)
        elif action == "add_attribute":
            if add_attribute_permission(request.POST):
                messages.success(request, "Attribute permission added.")
            else:
                messages.error(request, "Subject, attribute, resource, and action are required.")
        elif action == "save_deployment_config":
            tab = "deployment"
            if not request.user.is_superuser:
                messages.error(request, "Only a SuperAdmin can change deployment settings.")
            else:
                from gdx.deployment import save_deployment_config

                saved, message = save_deployment_config(request.POST)
                if saved:
                    messages.success(request, message)
                else:
                    messages.error(request, message)
        elif action == "delete_attribute":
            delete_attribute_permission(request.POST.get("index"))
            messages.success(request, "Attribute permission removed.")
        return _settings_redirect(tab, request)

    from apps.profiles.models import ACCESS_CHOICES
    from gdx.page_access import ACTIONS as page_actions
    from gdx.page_access import ROLES as page_roles
    from gdx.page_access import page_rows

    stored = load_settings()
    page_matrix = page_rows(stored["page_access"])
    sections = []
    for section in SECTIONS:
        fields = []
        for field in section["fields"]:
            current = dict(field)
            current["value"] = stored.get(field["name"], field["default"])
            fields.append(current)
        sections.append({**section, "fields": fields, "kind": "settings"})
    from django.contrib.auth.models import Permission
    from django.db.models import Count, Prefetch

    return render(
        request,
        "gdx_admin/settings/index.html",
        {
            "sections": sections,
            "active_tab": request.GET.get("tab") or "global",
            "attribute_permissions": stored["attribute_permissions"],
            "role_permissions": _role_permission_rows(stored),
            "page_roles": page_roles,
            "page_actions": page_actions,
            "page_rows": page_matrix,
            "access_choices": ACCESS_CHOICES,
            "deployment_config": _deployment_config(),
            "deployment_buckets": _deployment_buckets(),
            "deployment_engineer": (request.user.get_full_name() or "").strip() or request.user.get_username(),
            "deployment_allowed": request.user.is_superuser,
            "deployment_environments": _deployment_environment_choices(),
            "deployment_environment_label": _deployment_environment_label(),
            **_user_directory(request),
            "groups": Group.objects.order_by("name").annotate(member_count=Count("user")).prefetch_related(
                Prefetch(
                    "permissions",
                    queryset=Permission.objects.select_related("content_type").order_by(
                        "content_type__app_label", "codename"
                    ),
                )
            ),
        },
    )


def _deployment_config():
    from gdx.deployment import deployment_config

    return deployment_config()


def _deployment_buckets():
    from gdx.deployment import BUCKET_ENVIRONMENTS, ENVIRONMENT_LABELS, deployment_config

    buckets = deployment_config()["frontend_buckets"]
    return [
        {"id": environment, "label": ENVIRONMENT_LABELS[environment], "bucket": buckets.get(environment, "")}
        for environment in BUCKET_ENVIRONMENTS
    ]


def _deployment_environment_choices():
    from gdx.deployment import ENVIRONMENT_CHOICES

    return ENVIRONMENT_CHOICES


def _deployment_environment_label():
    from gdx.deployment import ENVIRONMENT_LABELS

    environment = _deployment_config().get("default_environment")
    return ENVIRONMENT_LABELS.get(environment, environment)


def _create_user(request):
    from django.contrib.auth import get_user_model

    username = (request.POST.get("username") or "").strip()
    email = (request.POST.get("email") or "").strip()
    if not username:
        messages.error(request, "A username is required.")
        return
    User = get_user_model()
    if User.objects.filter(username=username).exists():
        messages.error(request, "That username is already in use.")
        return
    user = User(username=username, email=email, first_name=request.POST.get("first_name", ""), last_name=request.POST.get("last_name", ""))
    user.set_unusable_password()
    _apply_access_type(user, request.POST.get("access_type"), request.user)
    user.save()
    profile = user.profile
    profile.access_type = _stored_access_type(user, request.POST.get("access_type"), request.user)
    if "is_verified" in request.POST:
        profile.is_verified = True
    profile.save(update_fields=["access_type", "is_verified"])
    messages.success(request, f"User {username} created.")


def _stored_access_type(user, requested, actor):
    from apps.profiles.models import ACCESS_ADMIN, ACCESS_CHOICES, ACCESS_SUPERADMIN, ACCESS_USER

    allowed = {key for key, _label in ACCESS_CHOICES}
    access_type = requested if requested in allowed else ACCESS_USER
    if access_type == ACCESS_SUPERADMIN and not getattr(actor, "is_superuser", False):
        access_type = ACCESS_ADMIN
    return access_type


def _apply_access_type(user, requested, actor):
    from apps.profiles.models import ACCESS_CHOICES, ACCESS_STAFF, ACCESS_SUPERADMIN, ACCESS_USER

    access_type = _stored_access_type(user, requested, actor)
    user.is_superuser = access_type == ACCESS_SUPERADMIN
    user.is_staff = access_type not in (ACCESS_STAFF, ACCESS_USER) and access_type in {key for key, _label in ACCESS_CHOICES}


def _set_verified(request):
    from django.contrib.auth import get_user_model

    user = get_user_model().objects.filter(pk=request.POST.get("user_id")).first()
    if user is None or user.is_superuser:
        messages.error(request, "Choose a user who is not a super admin.")
        return
    user.profile.is_verified = request.POST.get("verified") == "1"
    user.profile.save(update_fields=["is_verified"])
    messages.success(request, f"{user.username} is {'verified' if user.profile.is_verified else 'no longer verified'}.")


def _user_directory(request):
    from urllib.parse import urlencode

    from apps.profiles.models import ACCESS_CHOICES

    directory = _users_for_settings()
    query = (request.GET.get("q") or "").strip()
    access = (request.GET.get("access") or "").strip()
    verified = (request.GET.get("verified") or "").strip()
    allowed_access = {key for key, _label in ACCESS_CHOICES}
    if access not in allowed_access:
        access = ""
    if verified not in ("yes", "no"):
        verified = ""

    rows = directory
    if query:
        needle = query.casefold()
        rows = [
            user for user in rows
            if needle in " ".join((
                user.first_name or "",
                user.last_name or "",
                user.email or "",
                user.username or "",
            )).casefold()
        ]
    if access:
        rows = [user for user in rows if user.access_type == access]
    if verified == "yes":
        rows = [user for user in rows if user.access_verified]
    elif verified == "no":
        rows = [user for user in rows if not user.access_verified]

    page_size = 10
    total = len(rows)
    page_count = max(1, (total + page_size - 1) // page_size)
    try:
        page = int(request.GET.get("page") or 1)
    except ValueError:
        page = 1
    page = min(max(page, 1), page_count)
    start = (page - 1) * page_size

    def page_url(number):
        params = {"tab": "users"}
        if query:
            params["q"] = query
        if access:
            params["access"] = access
        if verified:
            params["verified"] = verified
        if number > 1:
            params["page"] = number
        return f"?{urlencode(params)}"

    return {
        "users": directory,
        "user_rows": rows[start:start + page_size],
        "user_total": total,
        "user_page": page,
        "user_pages": page_count,
        "user_query": query,
        "user_access": access,
        "user_verified": verified,
        "user_show_pager": total > page_size,
        "user_prev_url": page_url(page - 1) if page > 1 else "",
        "user_next_url": page_url(page + 1) if page < page_count else "",
        "user_page_links": [
            {"number": number, "url": page_url(number), "current": number == page}
            for number in range(1, page_count + 1)
        ],
    }


def _users_for_settings():
    from django.contrib.auth import get_user_model

    from django.contrib.auth.models import Group
    from django.db.models import Prefetch

    from apps.profiles.models import access_type_for

    users = []
    memberships = Prefetch("groups", queryset=Group.objects.order_by("id"))
    for user in get_user_model().objects.select_related("profile").order_by("username").prefetch_related(memberships):
        try:
            user.access_verified = bool(user.profile.is_verified)
        except ObjectDoesNotExist:
            user.access_verified = False
        user.primary_group = next(iter(user.groups.all()), None)
        user.access_type = access_type_for(user)
        users.append(user)
    return users


def _create_group(request):
    from django.contrib.auth.models import Group

    name = (request.POST.get("name") or "").strip()
    if not name:
        messages.error(request, "A group name is required.")
        return
    group, created = Group.objects.get_or_create(name=name)
    messages.success(request, f"Group {group.name} created." if created else f"Group {group.name} already exists.")


def _assign_group(request):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import Group

    user = get_user_model().objects.filter(pk=request.POST.get("user_id")).first()
    group = Group.objects.filter(pk=request.POST.get("group_id")).first()
    if user is None or group is None:
        messages.error(request, "Choose a user and a group.")
        return
    if request.POST.get("membership") == "remove":
        user.groups.remove(group)
        messages.success(request, f"Removed {user.username} from {group.name}.")
    else:
        user.groups.add(group)
        messages.success(request, f"Added {user.username} to {group.name}.")


def _role_permission_rows(stored):
    from apps.profiles.models import ACCESS_CHOICES

    granted = stored.get("role_permissions") or {}
    return [
        {"id": key, "label": label, "permissions": granted.get(key) or []}
        for key, label in ACCESS_CHOICES
    ]


def _grant_role_permission(request):
    from django.contrib.auth.models import Permission

    raw = (request.POST.get("permission") or "").strip()
    app_label, _, codename = raw.partition(".")
    permission = (
        Permission.objects.filter(content_type__app_label=app_label, codename=codename).first()
        if app_label and codename
        else None
    )
    if permission is None or not grant_role_permission(request.POST.get("access_type"), raw):
        messages.error(request, "Choose an access type and a permission such as auth.view_user.")
        return
    messages.success(request, f"Granted {raw} to that access type.")


def _revoke_role_permission(request):
    if revoke_role_permission(request.POST.get("access_type"), request.POST.get("permission")):
        messages.success(request, "Role permission removed.")


def _grant_permission(request):
    from django.contrib.auth.models import Group, Permission

    group = Group.objects.filter(pk=request.POST.get("group_id")).first()
    raw = (request.POST.get("permission") or "").strip()
    app_label, _, codename = raw.partition(".")
    permission = (
        Permission.objects.filter(content_type__app_label=app_label, codename=codename).first()
        if app_label and codename
        else None
    )
    if group is None or permission is None:
        messages.error(request, "Choose a group and a permission such as auth.view_user.")
        return
    group.permissions.add(permission)
    messages.success(request, f"Granted {permission.codename} to {group.name}.")


def _revoke_permission(request):
    from django.contrib.auth.models import Group, Permission

    group = Group.objects.filter(pk=request.POST.get("group_id")).first()
    permission = Permission.objects.filter(pk=request.POST.get("permission_id")).first()
    if group is None or permission is None:
        return
    group.permissions.remove(permission)
    messages.success(request, f"Removed {permission.codename} from {group.name}.")


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