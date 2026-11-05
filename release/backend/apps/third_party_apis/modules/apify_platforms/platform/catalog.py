from django.db.models import Q
from django.urls import NoReverseMatch, reverse
from django.utils import timezone
from django.utils.text import slugify

from apps.third_party_apis.registry import registry

from ..tenancy.models import EnterpriseTeam, TeamMembership, Tenant
from .models import Api, ApiEndpoint, ApiProduct, ApiSubscription, ApiVersion, PortalPublication, RuntimeEnvironment


def sync_catalog():
    """Create one catalog API for every registered marketplace module."""
    registry.autodiscover()
    tenant, _ = Tenant.objects.get_or_create(slug="data-marketplace", defaults={"name": "Data Marketplace"})
    environments = []
    for slug, name, production in (("sandbox", "Sandbox", False), ("test", "Test", False), ("prod", "Production", True)):
        environment, _ = RuntimeEnvironment.objects.get_or_create(
            tenant=tenant,
            slug=slug,
            defaults={"name": name, "is_production": production},
        )
        environments.append(environment)
    for module in registry.all():
        owner_name = getattr(module, "owner", "") or getattr(module, "default_source_name", "") or "GDX Data Marketplace"
        owner, _ = EnterpriseTeam.objects.get_or_create(
            tenant=tenant,
            slug=slugify(owner_name)[:50] or "gdx-data-marketplace",
            defaults={"name": owner_name[:160]},
        )
        endpoint = ""
        public = getattr(module, "public_endpoint", None)
        if callable(public):
            endpoint = public() or ""
        api, _ = Api.objects.get_or_create(
            module_key=module.key,
            defaults={
                "name": module.display_name or module.key,
                "slug": module.key[:50],
                "summary": getattr(module, "description", "") or "",
                "base_url": endpoint,
                "authentication": getattr(module, "frontend_authentication", "") or "Django authentication",
                "protocol": "rest",
                "status": Api.Status.DRAFT,
                "enterprise_owner": owner,
            },
        )
        version, _ = ApiVersion.objects.get_or_create(
            api=api,
            version="v1",
            defaults={"tenant": tenant, "specification": {}},
        )
        for item in getattr(module, "endpoints", ()) or ():
            path = endpoint
            route_name = item.get("route_name") or ""
            if route_name:
                try:
                    path = reverse(route_name)
                except NoReverseMatch:
                    path = endpoint
            ApiEndpoint.objects.get_or_create(
                version=version,
                method=(item.get("method") or "GET")[:12],
                path=path or "/",
                defaults={
                    "tenant": tenant,
                    "name": item.get("name") or "",
                    "required_scope": "",
                },
            )
        product, _ = ApiProduct.objects.get_or_create(
            tenant=tenant,
            slug=module.key[:50],
            defaults={
                "api": api,
                "owner_team": owner,
                "name": module.display_name or module.key,
                "published": False,
            },
        )
        if product.api_id is None:
            product.api = api
            product.save(update_fields=["api"])
        PortalPublication.objects.get_or_create(
            product=product,
            defaults={"tenant": tenant, "visibility": PortalPublication.Visibility.INTERNAL, "status": "draft"},
        )
    return Api.objects.count(), environments


def publication_for(api):
    return PortalPublication.objects.filter(product__api=api).order_by("created_at").first()


def user_team_ids(user):
    if not user or not user.is_authenticated:
        return []
    return list(TeamMembership.objects.filter(user=user, is_active=True).values_list("team_id", flat=True))


def user_owns(user, api):
    if not user or not user.is_authenticated or api.enterprise_owner_id is None:
        return False
    return api.enterprise_owner_id in user_team_ids(user)


def active_subscription(user, api):
    if not user or not user.is_authenticated:
        return ApiSubscription.objects.none()
    now = timezone.now()
    return ApiSubscription.objects.filter(
        product__api=api,
        status=ApiSubscription.Status.ACTIVE,
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).filter(
        Q(grantee=user) | Q(consumer_team_id__in=user_team_ids(user))
    )


def user_can_see(user, api):
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user_owns(user, api):
        return True
    if api.status != Api.Status.PUBLISHED:
        return False
    publication = publication_for(api)
    if publication and publication.visibility == PortalPublication.Visibility.RESTRICTED:
        team_ids = user_team_ids(user)
        return publication.allowed_teams.filter(pk__in=team_ids).exists() or active_subscription(user, api).exists()
    return True


def user_can_call(user, api):
    if not user or not user.is_authenticated:
        return False
    if api.status != Api.Status.PUBLISHED:
        return True
    if user.is_superuser or user_owns(user, api):
        return True
    return active_subscription(user, api).exists()


def published_staff_api(path):
    if not path.startswith("/sa/") or path.startswith("/sa/apify/"):
        return None
    for api in Api.objects.filter(status=Api.Status.PUBLISHED).exclude(base_url=""):
        base = api.base_url
        if base.startswith("/sa/") and (path == base or path.startswith(base.rstrip("/") + "/")):
            return api
    return None
