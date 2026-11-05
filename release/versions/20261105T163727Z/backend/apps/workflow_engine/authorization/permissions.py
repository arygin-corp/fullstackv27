from rest_framework.permissions import BasePermission


class IsWorkflowOperator(BasePermission):
    """Optional API-level permission example."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
