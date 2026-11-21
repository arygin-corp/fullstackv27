"""Grant permissions from the user's access type."""

from django.contrib.auth.backends import BaseBackend


class AccessTypePermissionBackend(BaseBackend):
    def has_perm(self, user_obj, perm, obj=None):
        if not getattr(user_obj, "is_authenticated", False) or not perm:
            return False
        from apps.profiles.models import access_type_for
        from gdx.platform_settings import load_settings

        granted = load_settings().get("role_permissions", {}).get(access_type_for(user_obj), [])
        return perm in granted
