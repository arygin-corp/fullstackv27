from django.core.exceptions import PermissionDenied
from .models import PageVersion

def require_version_view(user, version):
    if not user.is_authenticated:
        raise PermissionDenied
    if user.is_superuser or user.has_perm("pages.view_pageversion"):
        return version
    if version.status == PageVersion.Status.PUBLISHED:
        return version
    raise PermissionDenied

def require_version_edit(user, version):
    if not user.is_authenticated:
        raise PermissionDenied
    if version.status != PageVersion.Status.DRAFT:
        raise PermissionDenied("Only draft versions can be edited.")
    if not (user.is_superuser or user.has_perm("pages.change_pageversion") or user.has_perm("pages.change_contentblock")):
        raise PermissionDenied
    return version
