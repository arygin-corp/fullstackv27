from .access import access_decision, active_team_memberships


def tenant_context(request):
    if request.user.is_authenticated:
        decision = access_decision(request.user)
        team_memberships = active_team_memberships(request.user)
    else:
        decision = {
            "allowed": False,
            "platform_owner": False,
        }
        team_memberships = []

    return {
        "active_tenant": getattr(request, "tenant", None),
        "available_tenants": (
            request.user.tenant_memberships
            .filter(is_active=True)
            .select_related("tenant")
            if request.user.is_authenticated
            else []
        ),
        "available_team_memberships": team_memberships,
        "has_apify_access": decision["allowed"],
        "is_platform_owner": False,
    }

# from .access import access_decision
#
# def tenant_context(request):
#     decision = (
#         access_decision(request.user)
#         if request.user.is_authenticated
#         else {"allowed": False, "platform_owner": False}
#     )
#     return {
#         "active_tenant": getattr(request, "tenant", None),
#         "available_tenants": request.user.tenant_memberships.filter(
#             is_active=True
#         ).select_related("tenant")
#         if request.user.is_authenticated
#         else [],
#         "has_apify_access": decision["allowed"],
#         "is_platform_owner": decision["platform_owner"],
#     }
