from django.http import HttpResponseForbidden

from .catalog import published_staff_api, user_can_call


class CatalogAccessMiddleware:
    """Published staff apps open only for a subscribed user or the owning team."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            try:
                api = published_staff_api(request.path)
            except Exception:
                api = None
            if api is not None and not user_can_call(user, api):
                return HttpResponseForbidden("A catalog subscription is required for this app.")
        return self.get_response(request)
