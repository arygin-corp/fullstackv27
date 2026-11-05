def _claim(request, name, default=""):
    claims = getattr(request, "entra_claims", {}) or getattr(request, "auth", {}) or {}
    if isinstance(claims, dict): return str(claims.get(name) or default)
    return str(default)

def resolve_creator(request):
    user = request.user
    return {"object_id": _claim(request, "oid", getattr(user, "object_id", user.pk)), "email": getattr(user, "email", ""), "display_name": user.get_full_name() or getattr(user, "username", ""), "workday_id": str(getattr(user, "workday_id", "")), "company_name": str(getattr(user, "company_name", ""))}

def resolve_requested_for(request, cart, submitted=None):
    if cart.requested_for_snapshot: return dict(cart.requested_for_snapshot)
    submitted = submitted or {}
    return {"object_id": str(submitted.get("object_id") or resolve_creator(request)["object_id"]), "email": str(submitted.get("email") or resolve_creator(request)["email"]), "display_name": str(submitted.get("display_name") or resolve_creator(request)["display_name"]), "workday_id": str(submitted.get("workday_id") or ""), "company_name": str(submitted.get("company_name") or "")}
