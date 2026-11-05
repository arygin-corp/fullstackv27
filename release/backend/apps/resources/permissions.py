from rest_framework.permissions import BasePermission, SAFE_METHODS

SUPER='Super Administrator Group'; ADMIN='Administrator Group'; CONTENT='Content Manager Group'; WEB='Web Publishers Group'; SECURITY='Data Security Group'

def group_names(user):
    if not user or not user.is_authenticated: return set()
    return set(user.groups.values_list('name', flat=True))

def can_approve(user, change_request):
    if not user or not user.is_authenticated or user.pk == change_request.submitter_id: return False
    groups=group_names(user)
    submitter_groups=group_names(change_request.submitter)
    if SUPER in groups: return True
    if CONTENT in submitter_groups: return ADMIN in groups
    if WEB in submitter_groups: return bool(groups & {CONTENT, ADMIN})
    if SECURITY in submitter_groups: return ADMIN in groups
    return ADMIN in groups

class IsAuthenticatedReadAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated: return False
        return request.method in SAFE_METHODS or bool(group_names(request.user) & {SUPER,ADMIN,CONTENT,WEB,SECURITY})

class CanApproveResourceChange(BasePermission):
    def has_object_permission(self, request, view, obj): return can_approve(request.user,obj)
