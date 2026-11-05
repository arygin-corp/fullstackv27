import hashlib
import secrets
from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from apps.notifications.models import NotificationType
from apps.notifications.services.ingress import publish

from ..audit.models import AuditEvent
from ..platform.catalog import active_subscription, sync_catalog, user_can_see, user_owns, user_team_ids
from ..platform.models import (
    Api,
    ApiAccessRequest,
    ApiMetric,
    ApiProduct,
    ApiProxy,
    ApiSubscription,
    ClientApplication,
    ClientCredential,
    PolicyDefinition,
    PortalPublication,
    RatePlan,
    RuntimeEnvironment,
    SecurityFinding,
    ThreatEvent,
    UsageRecord,
)
from ..tenancy.models import EnterpriseTeam, TeamMembership


def _page(title):
    return {"page_title": title, "page_subtitle": "API catalog", "breadcrumbs": [{"label": title}]}


def _environment():
    return RuntimeEnvironment.objects.filter(slug="sandbox").order_by("created_at").first() or RuntimeEnvironment.objects.order_by("created_at").first()


def _team_for(user):
    membership = TeamMembership.objects.filter(user=user, is_active=True).select_related("team").first()
    if membership:
        return membership.team
    team = EnterpriseTeam.objects.order_by("created_at").first()
    return team


def _visible(user):
    return [api for api in Api.objects.select_related("enterprise_owner").order_by("name") if user_can_see(user, api)]


@login_required
def dashboard(request):
    sync_catalog()
    apis = _visible(request.user)
    pending = ApiAccessRequest.objects.filter(status=ApiAccessRequest.Status.SUBMITTED).select_related("product", "grantee")[:8]
    metrics = [
        {"label": "APIs", "value": len(apis)},
        {"label": "Published", "value": sum(1 for api in apis if api.status == Api.Status.PUBLISHED)},
        {"label": "Subscriptions", "value": ApiSubscription.objects.filter(status=ApiSubscription.Status.ACTIVE).count()},
        {"label": "Open requests", "value": ApiAccessRequest.objects.filter(status=ApiAccessRequest.Status.SUBMITTED).count()},
    ]
    return render(request, "apify_admin/dashboard/dashboard.html", {**_page("Dashboard"), "metrics": metrics, "pending_requests": pending, "active_nav": "dashboard"})


@login_required
def api_catalog(request):
    sync_catalog()
    query = (request.GET.get("q") or "").strip()
    status = request.GET.get("status") or ""
    mine = request.GET.get("mine") == "1"
    apis = _visible(request.user)
    if query:
        apis = [api for api in apis if query.lower() in api.name.lower() or query.lower() in (api.summary or "").lower() or query.lower() in (api.module_key or "")]
    if status:
        apis = [api for api in apis if api.status == status]
    if mine:
        subscribed = set(ApiSubscription.objects.filter(status=ApiSubscription.Status.ACTIVE).filter(Q(grantee=request.user) | Q(consumer_team_id__in=user_team_ids(request.user))).values_list("product__api_id", flat=True))
        apis = [api for api in apis if api.id in subscribed or user_owns(request.user, api)]
    return render(request, "apify_admin/api_catalog/list.html", {**_page("API catalog"), "apis": apis, "query": query, "status": status, "mine": mine, "active_nav": "apis"})


@login_required
def api_detail(request, pk):
    api = get_object_or_404(Api, pk=pk)
    if not user_can_see(request.user, api):
        messages.error(request, "You cannot view this API.")
        return redirect("apify_admin:api_catalog")
    product = api.products.order_by("created_at").first()
    publication = PortalPublication.objects.filter(product=product).first() if product else None
    endpoints = []
    version = api.versions.order_by("version").first()
    if version:
        endpoints = list(version.endpoints.order_by("path"))
    subscription = active_subscription(request.user, api).first()
    return render(request, "apify_admin/api_catalog/detail.html", {
        **_page(api.name),
        "api": api,
        "product": product,
        "publication": publication,
        "endpoints": endpoints,
        "subscription": subscription,
        "can_publish": user_owns(request.user, api) or request.user.is_superuser,
        "environments": RuntimeEnvironment.objects.order_by("name"),
        "detail_fields": [
            {"label": "Module", "value": api.module_key},
            {"label": "Summary", "value": api.summary},
            {"label": "Method", "value": "GET"},
            {"label": "Path", "value": api.base_url},
            {"label": "Authentication", "value": api.authentication},
            {"label": "Status", "value": api.get_status_display()},
            {"label": "Visibility", "value": publication.get_visibility_display() if publication else "Internal"},
            {"label": "Your access", "value": "Subscribed" if subscription else "Not subscribed"},
        ],
        "active_nav": "apis",
    })


@login_required
@require_POST
def api_publish(request, pk):
    api = get_object_or_404(Api, pk=pk)
    if not (user_owns(request.user, api) or request.user.is_superuser):
        messages.error(request, "Only the owning team can publish this API.")
        return redirect("apify_admin:api-detail", pk=api.pk)
    visibility = request.POST.get("visibility") or PortalPublication.Visibility.INTERNAL
    api.status = Api.Status.PUBLISHED
    api.save(update_fields=["status", "updated_at"])
    product = api.products.order_by("created_at").first()
    if product:
        product.published = True
        product.save(update_fields=["published", "updated_at"])
        PortalPublication.objects.filter(product=product).update(status="published", visibility=visibility)
    messages.success(request, "API published.")
    return redirect("apify_admin:api-detail", pk=api.pk)


@login_required
@require_POST
def request_access(request, pk):
    api = get_object_or_404(Api, pk=pk)
    product = api.products.order_by("created_at").first()
    team = _team_for(request.user)
    environment = RuntimeEnvironment.objects.filter(pk=request.POST.get("environment")).first() or _environment()
    if product is None or team is None or environment is None:
        messages.error(request, "This API is not ready for access requests.")
        return redirect("apify_admin:api-detail", pk=api.pk)
    access_request = ApiAccessRequest.objects.create(
        tenant=product.tenant,
        product=product,
        requesting_team=team,
        grantee=request.user,
        environment=environment,
        justification=(request.POST.get("justification") or "Access requested from the catalog.").strip(),
        requested_by=request.user,
        status=ApiAccessRequest.Status.SUBMITTED,
    )
    if api.enterprise_owner_id:
        for membership in TeamMembership.objects.filter(team_id=api.enterprise_owner_id, is_active=True).select_related("user"):
            publish(
                recipient=membership.user,
                title=f"Access request for {api.name}",
                body=access_request.justification,
                url=f"/sa/apify/sandbox/access-requests/{access_request.pk}/",
                notification_type=NotificationType.APPROVAL,
                source="apify",
                source_object_type="api-access-request",
                source_object_id=access_request.pk,
                idempotency_key=f"catalog-request:{access_request.pk}:{membership.user_id}",
            )
    messages.success(request, "Access request sent to the owning team.")
    return redirect("apify_admin:access-request-detail", pk=access_request.pk)


def _record(actor, event_type, obj):
    AuditEvent.objects.create(actor=actor, actor_identifier=getattr(actor, "username", ""), event_type=event_type, object_type=obj.__class__.__name__, object_id=str(obj.pk), event_hash=hashlib.sha256(f"{event_type}{obj.pk}{timezone.now().timestamp()}".encode()).hexdigest())


@login_required
@require_POST
def approve_request(request, pk):
    access_request = get_object_or_404(ApiAccessRequest, pk=pk)
    if access_request.status == ApiAccessRequest.Status.APPROVED:
        messages.info(request, "This request is already approved.")
        return redirect("apify_admin:access-request-detail", pk=pk)
    api = access_request.product.api
    if api and not (user_owns(request.user, api) or request.user.is_superuser):
        messages.error(request, "Only the owning team can approve this request.")
        return redirect("apify_admin:access-request-detail", pk=pk)
    access_request.status = ApiAccessRequest.Status.APPROVED
    access_request.reviewed_by = request.user
    access_request.reviewed_at = timezone.now()
    access_request.save()
    subscription, _ = ApiSubscription.objects.get_or_create(
        request=access_request,
        defaults={
            "tenant": access_request.tenant,
            "product": access_request.product,
            "consumer_team": access_request.requesting_team,
            "grantee": access_request.grantee,
            "environment": access_request.environment or _environment(),
            "approved_by": request.user,
            "expires_at": timezone.now() + timedelta(days=365),
            "status": ApiSubscription.Status.ACTIVE,
        },
    )
    raw = secrets.token_urlsafe(32)
    credential = ClientCredential.objects.create(
        tenant=access_request.tenant,
        application=access_request.application or ClientApplication.objects.create(tenant=access_request.tenant, owner_team=access_request.requesting_team, name=f"{access_request.grantee_id or access_request.requesting_team_id}", slug=f"app-{access_request.pk.hex[:12]}"),
        subscription=subscription,
        credential_type="client_secret",
        client_id=f"apify_{access_request.pk.hex[:16]}",
        secret_hash=hashlib.sha256(raw.encode()).hexdigest(),
        fingerprint=hashlib.sha256(raw.encode()).hexdigest()[:16],
        issued_at=timezone.now(),
        expires_at=subscription.expires_at,
    )
    if access_request.application_id is None:
        access_request.application = credential.application
        access_request.save(update_fields=["application"])
        subscription.application = credential.application
        subscription.save(update_fields=["application"])
    UsageRecord.objects.get_or_create(
        subscription=subscription,
        period_start=timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        defaults={"tenant": access_request.tenant, "period_end": timezone.now() + timedelta(days=31)},
    )
    if access_request.grantee_id:
        publish(recipient=access_request.grantee, title=f"Access approved for {access_request.product.name}", body="Your catalog subscription is active.", url=f"/sa/apify/sandbox/subscriptions/{subscription.pk}/", notification_type=NotificationType.APPROVAL, source="apify", idempotency_key=f"catalog-approved:{access_request.pk}")
    request.session["catalog_one_time_secret"] = raw
    request.session["catalog_credential_id"] = str(credential.pk)
    _record(request.user, "catalog.access.approved", access_request)
    messages.success(request, "Request approved. Copy the client secret from the next screen.")
    return redirect("apify_admin:credential-secret", pk=credential.pk)


@login_required
@require_POST
def reject_request(request, pk):
    access_request = get_object_or_404(ApiAccessRequest, pk=pk)
    access_request.status = ApiAccessRequest.Status.REJECTED
    access_request.reviewed_by = request.user
    access_request.reviewed_at = timezone.now()
    access_request.save()
    if access_request.grantee_id:
        publish(recipient=access_request.grantee, title=f"Access declined for {access_request.product.name}", body=request.POST.get("reason") or "The owning team declined this request.", notification_type=NotificationType.GOVERNANCE, source="apify", idempotency_key=f"catalog-rejected:{access_request.pk}")
    messages.success(request, "Request declined.")
    return redirect("apify_admin:access_requests")


def _list(request, template, key, queryset, title, nav):
    query = (request.GET.get("q") or "").strip()
    return render(request, template, {**_page(title), key: queryset, "query": query, "active_nav": nav})


@login_required
def products(request):
    return _list(request, "apify_admin/api_products/list.html", "products", ApiProduct.objects.select_related("api").order_by("name"), "API products", "products")


@login_required
def product_detail(request, pk):
    product = get_object_or_404(ApiProduct, pk=pk)
    return render(request, "apify_admin/api_products/detail.html", {**_page(product.name), "product": product, "detail_fields": [{"label": "API", "value": product.api}, {"label": "Published", "value": product.published}, {"label": "Owner", "value": product.owner_team}]})


@login_required
def policies(request):
    return _list(request, "apify_admin/policies/list.html", "policies", PolicyDefinition.objects.order_by("name"), "Policies", "policies")


@login_required
def policy_detail(request, pk):
    policy = get_object_or_404(PolicyDefinition, pk=pk)
    return render(request, "apify_admin/policies/detail.html", {**_page(policy.name), "policy": policy, "detail_fields": [{"label": "Type", "value": policy.policy_type}, {"label": "Status", "value": policy.status}]})


@login_required
def applications(request):
    return _list(request, "apify_admin/client_applications/list.html", "applications", ClientApplication.objects.order_by("name"), "Applications", "applications")


@login_required
def application_detail(request, pk):
    application = get_object_or_404(ClientApplication, pk=pk)
    return render(request, "apify_admin/client_applications/detail.html", {**_page(application.name), "application": application, "detail_fields": [{"label": "Status", "value": application.status}, {"label": "Owner", "value": application.owner_team}]})


@login_required
def credentials(request):
    return _list(request, "apify_admin/client_credentials/list.html", "credentials", ClientCredential.objects.order_by("-issued_at"), "Credentials", "credentials")


@login_required
def credential_detail(request, pk):
    credential = get_object_or_404(ClientCredential, pk=pk)
    return render(request, "apify_admin/client_credentials/detail.html", {**_page(credential.client_id), "credential": credential, "detail_fields": [{"label": "Type", "value": credential.credential_type}, {"label": "Status", "value": credential.status}, {"label": "Expires", "value": credential.expires_at}]})


@login_required
def credential_secret(request, pk):
    credential = get_object_or_404(ClientCredential, pk=pk)
    secret = request.session.pop("catalog_one_time_secret", "")
    return render(request, "apify_admin/client_credentials/secret_once.html", {"credential": credential, "one_time_secret": secret})


@login_required
@require_POST
def credential_rotate(request, pk):
    credential = get_object_or_404(ClientCredential, pk=pk)
    raw = secrets.token_urlsafe(32)
    credential.secret_hash = hashlib.sha256(raw.encode()).hexdigest()
    credential.fingerprint = credential.secret_hash[:16]
    credential.issued_at = timezone.now()
    credential.status = "active"
    credential.save()
    request.session["catalog_one_time_secret"] = raw
    return redirect("apify_admin:credential-secret", pk=credential.pk)


@login_required
@require_POST
def credential_revoke(request, pk):
    credential = get_object_or_404(ClientCredential, pk=pk)
    credential.status = "revoked"
    credential.save(update_fields=["status", "updated_at"])
    if credential.subscription_id:
        credential.subscription.status = ApiSubscription.Status.REVOKED
        credential.subscription.save(update_fields=["status", "updated_at"])
    messages.success(request, "Credential revoked.")
    return redirect("apify_admin:credentials")


@login_required
def access_requests(request):
    return _list(request, "apify_admin/access_requests/list.html", "access_requests", ApiAccessRequest.objects.select_related("product", "grantee").order_by("-created_at"), "Access requests", "requests")


@login_required
def access_request_detail(request, pk):
    item = get_object_or_404(ApiAccessRequest.objects.select_related("product", "grantee", "environment"), pk=pk)
    api = item.product.api
    return render(request, "apify_admin/access_requests/detail.html", {
        **_page("Access request"),
        "access_request": item,
        "can_review": api and (user_owns(request.user, api) or request.user.is_superuser) and item.status == ApiAccessRequest.Status.SUBMITTED,
        "detail_fields": [
            {"label": "API", "value": item.product},
            {"label": "Person", "value": item.grantee},
            {"label": "Team", "value": item.requesting_team},
            {"label": "Environment", "value": item.environment},
            {"label": "Status", "value": item.get_status_display()},
            {"label": "Justification", "value": item.justification},
        ],
    })


@login_required
def subscriptions(request):
    query = (request.GET.get("q") or "").strip()
    rows = ApiSubscription.objects.select_related("product", "grantee", "environment").order_by("-created_at")
    if request.GET.get("mine") == "1":
        rows = rows.filter(Q(grantee=request.user) | Q(consumer_team_id__in=user_team_ids(request.user)))
    if query:
        rows = rows.filter(product__name__icontains=query)
    return render(request, "apify_admin/subscriptions/list.html", {**_page("Subscriptions"), "subscriptions": rows, "active_nav": "subscriptions"})


@login_required
def subscription_detail(request, pk):
    subscription = get_object_or_404(ApiSubscription, pk=pk)
    return render(request, "apify_admin/subscriptions/detail.html", {**_page("Subscription"), "subscription": subscription, "detail_fields": [{"label": "API", "value": subscription.product}, {"label": "Person", "value": subscription.grantee}, {"label": "Team", "value": subscription.consumer_team}, {"label": "Environment", "value": subscription.environment}, {"label": "Status", "value": subscription.get_status_display()}, {"label": "Expires", "value": subscription.expires_at}]})


@login_required
def analytics(request):
    usage = UsageRecord.objects.select_related("subscription")
    metrics = ApiMetric.objects.order_by("-bucket_start")[:20]
    return render(request, "apify_admin/analytics/overview.html", {**_page("Analytics"), "usage": usage, "metrics_rows": metrics, "active_nav": "analytics"})


@login_required
def audit(request):
    return _list(request, "apify_admin/audit/list.html", "events", AuditEvent.objects.order_by("-occurred_at"), "Audit", "audit")


@login_required
def audit_detail(request, pk):
    event = get_object_or_404(AuditEvent, pk=pk)
    return render(request, "apify_admin/audit/detail.html", {**_page(event.event_type), "event": event, "detail_fields": [{"label": "When", "value": event.occurred_at}, {"label": "Actor", "value": event.actor}, {"label": "Object", "value": event.object_id}]})


@login_required
def proxies(request):
    return _list(request, "apify_admin/policies/list.html", "policies", ApiProxy.objects.order_by("name"), "Proxies", "policies")


@login_required
def findings(request):
    return _list(request, "apify_admin/audit/list.html", "events", SecurityFinding.objects.none(), "Security findings", "audit")


@login_required
@require_http_methods(["GET"])
def settings_page(request):
    return render(request, "apify_admin/administration/settings.html", {**_page("Settings"), "plans": RatePlan.objects.order_by("name"), "threats": ThreatEvent.objects.order_by("-created_at")[:20]})
