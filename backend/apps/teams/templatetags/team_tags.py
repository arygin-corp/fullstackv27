from django import template

register = template.Library()

_PLACEHOLDERS = {"", "default.gif", "default.jpg", "default.png", "default.svg"}


def _initials(user):
    first = (getattr(user, "first_name", "") or "").strip()[:1]
    last = (getattr(user, "last_name", "") or "").strip()[:1]
    if not first and not last:
        first = (user.get_username() or "?")[:1]
    return (first + last).upper()


def _photo_url(user):
    profile = getattr(user, "profile", None)
    photo = getattr(profile, "image", None)
    name = (getattr(photo, "name", "") or "").rsplit("/", 1)[-1].lower()
    if name in _PLACEHOLDERS:
        return ""
    return photo.url


@register.inclusion_tag("gdx_admin/pages/teams/_avatar.html")
def user_avatar(user):
    return {"image": _photo_url(user), "initials": _initials(user)}
