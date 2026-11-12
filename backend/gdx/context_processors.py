from django.conf import settings

HEADER_ENVIRONMENTS = (
    ("demo", "Demo"),
    ("dev", "Dev"),
    ("stage", "Stage"),
    ("qa", "QA"),
    ("prod", "Prod"),
)


def site_identity(request):
    from gdx.platform_settings import load_settings

    stored = load_settings()
    return {
        "organization_name": stored.get("organization_name") or "Toyota Motor North America",
        "team_owner_name": stored.get("team_owner_name") or "Data Marketplace Team",
        "app_name": stored.get("app_name") or "GDX Data Marketplace",
        "footer_text": stored.get("footer_text") or "GDX Data Marketplace | Toyota Motor North America. Design & Develop by Data Marketplace Team",
        "maintenance_headline": stored.get("maintenance_headline") or "We'll be back.",
        "maintenance_message": stored.get("maintenance_message") or "The website is down for maintenance. Check back later.",
    }


def header_environment(request):
    allowed = dict(HEADER_ENVIRONMENTS)
    selected = request.session.get("gdx_environment")
    if selected not in allowed:
        app_env = getattr(settings, "APP_ENV", "")
        selected = app_env if app_env in allowed else "dev"
    return {
        "header_environments": HEADER_ENVIRONMENTS,
        "header_environment": selected,
    }


_PLACEHOLDER_IMAGES = {"", "default.gif", "default.jpg", "default.png", "default.svg"}


def staff_page_header(request):
    """Default banner for admin pages that do not supply their own."""
    match = getattr(request, "resolver_match", None)
    namespace = ""
    url_name = "page"
    if match is not None:
        namespace = (match.namespace or match.app_name or "gdx").split(":")[0]
        url_name = match.url_name or "page"
    kicker = namespace.replace("_", " ").replace("-", " ").strip().upper() or "GDX ADMIN"
    words = url_name.replace("_", " ").replace("-", " ").strip()
    if not words or words.lower() in {"list", "index", "page", "detail"}:
        title = kicker.title()
    else:
        title = words[:1].upper() + words[1:]
    description = f"Review {title.lower()} and take the next action from this page."
    return {
        "staff_page_kicker": kicker,
        "staff_page_title": title,
        "staff_page_description": description,
        "staff_page_icon": "▦",
        "staff_page_metric_label": "Overview",
        "staff_page_metric_value": "—",
        "staff_page_metric_caption": "current view",
        "staff_page_heading": title,
        "staff_page_heading_text": description,
        "staff_page_mark_read": False,
        "greeting": _platform_greeting(request),
    }


def _platform_greeting(request):
    from apps.profiles.models import ACCESS_CHOICES, access_type_for
    from apps.third_party_apis.modules.command_center.views import _chicago_now, welcome_message

    now = _chicago_now()
    user = getattr(request, "user", None)
    signed_in = user is not None and getattr(user, "is_authenticated", False)
    if signed_in:
        raw = str(getattr(user, "first_name", "") or "").split("(")[0].strip()
        name = raw.split()[0] if raw else ""
        if not name:
            name = (user.get_username() or "there").split("@")[0]
        role = dict(ACCESS_CHOICES).get(access_type_for(user), "User")
    else:
        name = "there"
        role = "Guest"
    environments = {"demo": "Demo", "dev": "Dev", "stage": "Stage", "qa": "QA", "prod": "Prod"}
    selected = request.session.get("gdx_environment")
    if selected not in environments:
        selected = "dev"
    clock = now.strftime("%I:%M %p").lstrip("0")
    return {
        "greeting": welcome_message(now, name),
        "date": f"{now.strftime('%A, %B')} {now.day}",
        "time": clock,
        "environment": environments[selected],
        "role": role,
    }


def header_account(request):
    """Photo and initials for the signed-in user shown in the header."""
    user = getattr(request, "user", None)
    empty = {"header_user_image": "", "header_user_initials": "", "header_user_name": "", "header_user_role": ""}
    if user is None or not getattr(user, "is_authenticated", False):
        return empty
    first = (getattr(user, "first_name", "") or "").strip()
    last = (getattr(user, "last_name", "") or "").strip()
    initials = (first[:1] + last[:1]).upper()
    if not initials:
        initials = ((getattr(user, "get_username", lambda: "")() or "?")[:1]).upper()
    name = f"{first} {last}".strip() or user.get_username()
    role = "Administrator" if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False) else ""
    image = ""
    try:
        profile = user.profile
        photo = getattr(profile, "image", None)
        photo_name = (getattr(photo, "name", "") or "").rsplit("/", 1)[-1].lower()
        if photo_name not in _PLACEHOLDER_IMAGES:
            image = photo.url
        job_title = (getattr(profile, "job_title", "") or "").strip()
        if job_title:
            role = job_title
    except Exception:
        image = ""
    return {
        "header_user_image": image,
        "header_user_initials": initials,
        "header_user_name": name,
        "header_user_role": role,
    }


def header_notifications(request):
    """Five newest notifications for the signed-in user."""
    user = getattr(request, "user", None)
    empty = {"header_notifications": [], "header_notification_unread": 0}
    if user is None or not getattr(user, "is_authenticated", False):
        return empty
    try:
        from django.db.utils import DatabaseError, OperationalError, ProgrammingError
        from apps.notifications.models import Notification

        rows = Notification.objects.filter(recipient=user, is_deleted=False).order_by("-created_at")
        return {
            "header_notifications": list(rows[:5]),
            "header_notification_unread": rows.filter(read=False).count(),
        }
    except (DatabaseError, OperationalError, ProgrammingError):
        return empty


def staff_sidebar(request):
    from gdx.sidebar_nav import sidebar_sections
    from gdx.staff_menu import allowed_sections

    return {
        "sidebar_sections": sidebar_sections(request),
        "staff_menu": allowed_sections(getattr(request, "user", None)),
    }


def app_display_version(request):
    """
    Expose the human-readable application release version
    to Django HTML templates.
    """

    version = str(settings.APP_DISPLAY_VERSION or "")
    short = ".".join(version.split(".")[:2])
    return {
        "app_version": version,
        "app_version_short": short,
    }