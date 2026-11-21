from django.conf import settings
from django.http import HttpResponseForbidden
from apps.third_party_apis.modules.apify_platforms.audit.services import record_event
from .access import access_decision


class ApplicationAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        public = tuple(
            getattr(
                settings,
                "APIFY_PUBLIC_PATH_PREFIXES",
                ("/apify-admin/login/", "/admin/login/", "/static/", "/health/"),
            )
        )
        if not request.path.startswith(
            ("/apify-admin/", "/api/v1/")
        ) or request.path.startswith(public):
            return self.get_response(request)
        if not request.user.is_authenticated:
            return self.get_response(request)
        decision = access_decision(request.user)
        # request.apify_platform_owner = decision["platform_owner"]
        request.apify_platform_owner = False
        request.apify_access_allowed = decision["allowed"]
        if not decision["allowed"]:
            record_event(
                event_type="application.access.denied",
                actor=request.user,
                tenant=getattr(request, "tenant", None),
                category="authorization",
                action="access_app",
                outcome="failure",
                severity="warning",
                request=request,
                metadata={"reason": decision["reason"]},
            )
            return HttpResponseForbidden(
                "Access requires membership in an authorized application access group."
            )
        record_event(
            event_type="application.access.granted",
            actor=request.user,
            tenant=getattr(request, "tenant", None),
            category="authorization",
            action="access_app",
            outcome="success",
            request=request,
            metadata={"platform_owner": decision["platform_owner"]},
        )
        return self.get_response(request)
