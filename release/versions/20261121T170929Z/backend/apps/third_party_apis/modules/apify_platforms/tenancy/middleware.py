from django.core.exceptions import PermissionDenied
from .models import Tenant, TenantMembership


class ActiveTenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None

        if request.user.is_authenticated:
            tenant_id = (
                request.headers.get("X-Apify-Tenant")
                or request.session.get("apify_active_tenant_id")
            )

            memberships = (
                TenantMembership.objects
                .select_related("tenant")
                .filter(user=request.user, is_active=True,)
                .order_by("tenant__name", "tenant_id")
            )

            if tenant_id:
                membership = memberships.filter(tenant_id=tenant_id,).first()

                if membership:
                    request.tenant = membership.tenant
                elif request.user.is_superuser:
                    request.tenant = Tenant.objects.filter(pk=tenant_id,).first()
                else:
                    raise PermissionDenied("Invalid tenant context.")
            else:
                membership = memberships.first()

                if membership:
                    request.tenant = membership.tenant
                    request.session["apify_active_tenant_id"] = str(membership.tenant_id)

        return self.get_response(request)

class ActiveTenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        if request.user.is_authenticated:
            tid = request.headers.get("X-Apify-Tenant") or request.session.get(
                "apify_active_tenant_id"
            )
            qs = (TenantMembership.objects.select_related("tenant")
                .filter(user=request.user, is_active=True,)
                .order_by("tenant__name", "tenant_id")
            )

            if tid:
                m = qs.filter(tenant_id=tid).first()
                if not m and not request.user.is_superuser:
                    raise PermissionDenied("Invalid tenant context.")
                request.tenant = (
                    m.tenant if m else Tenant.objects.filter(pk=tid).first()
                )
            else:
                m = qs.first()
                request.tenant = m.tenant if m else None
                if m:
                    request.session["apify_active_tenant_id"] = str(
                        m.tenant_id
                    )
        return self.get_response(request)

