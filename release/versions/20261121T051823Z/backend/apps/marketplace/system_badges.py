"""Hardcoded badges loaded from assets/images/badges/system."""

import re
from difflib import SequenceMatcher
from pathlib import Path

from django.conf import settings
from django.db import ProgrammingError
from django.db.utils import OperationalError

SYSTEM_BADGE_NAMES = {
    "pi": "PI",
    "spi": "SPI",
    "pi-spi": "PI/SPI",
}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif"}
SUPERADMIN_GROUPS = {
    "super administrator group",
    "superadmin group",
    "super admin group",
    "superadmin",
}


def system_badge_directory():
    return Path(settings.BASE_DIR) / "assets" / "images" / "badges" / "system"


def system_badge_files():
    directory = system_badge_directory()
    if not directory.is_dir():
        return []
    rows = []
    for path in sorted(directory.iterdir()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        key = path.stem
        name = SYSTEM_BADGE_NAMES.get(key, key.replace("_", " ").replace("-", " ").title())
        rows.append((key, name[:50], f"images/badges/system/{path.name}"))
    return rows


def normalize_badge_name(name):
    return re.sub(r"[^a-z0-9]", "", (name or "").casefold())


def _names_are_similar(left, right):
    if not left or not right:
        return False
    if left == right:
        return True
    shorter, longer = (left, right) if len(left) <= len(right) else (right, left)
    if len(shorter) >= 6 and longer.startswith(shorter):
        return True
    return SequenceMatcher(None, left, right).ratio() >= 0.90


def similar_system_badge(name, exclude_pk=None):
    from .models import Badge

    submitted = normalize_badge_name(name)
    if not submitted:
        return None
    badges = Badge.objects.filter(is_system=True)
    if exclude_pk:
        badges = badges.exclude(pk=exclude_pk)
    for badge in badges:
        candidates = (normalize_badge_name(badge.name), normalize_badge_name(badge.system_key))
        if any(_names_are_similar(submitted, candidate) for candidate in candidates):
            return badge
    return None


def user_is_superadmin(user):
    if not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    from apps.profiles.models import ACCESS_SUPERADMIN, access_type_for

    if access_type_for(user) == ACCESS_SUPERADMIN:
        return True
    names = {name.casefold() for name in user.groups.values_list("name", flat=True)}
    return bool(names & SUPERADMIN_GROUPS)


def ensure_system_badges():
    from .models import Badge

    try:
        for key, name, image in system_badge_files():
            badge = Badge.objects.filter(system_key=key).first()
            if badge is None:
                badge = Badge.objects.filter(system_key__isnull=True, name__iexact=name).first()
            if badge is None:
                Badge.objects.create(
                    name=name,
                    is_active=True,
                    is_system=True,
                    system_key=key,
                    image=image,
                )
                continue
            changed = []
            if badge.system_key != key:
                badge.system_key = key
                changed.append("system_key")
            if not badge.is_system:
                badge.is_system = True
                changed.append("is_system")
            if badge.image != image:
                badge.image = image
                changed.append("image")
            if not badge.name:
                badge.name = name
                changed.append("name")
            if changed:
                badge.save(update_fields=changed)
    except (OperationalError, ProgrammingError):
        return
