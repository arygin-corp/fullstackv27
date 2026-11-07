import json
from functools import wraps
from django.http.response import HttpResponse
from django.http.request import HttpRequest
from django.http import StreamingHttpResponse
import time
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_http_methods, require_POST
from django import forms
from .models import (AuditLedgerEntry, AuditLedgerVerification, DeadLetterStatus, DeliveryChannel, DeliveryStatus, DynamicAudience, NotificationDeadLetter,
    NotificationDelivery, NotificationOutbox, NotificationRule, OutboxStatus, Notification, NotificationType, NotificationSummary, PushDevice, NotificationBundle,
    NotificationCampaign, TeamsDestination, NotificationTemplate, NotificationPreference,
)
from .monitoring.alerts import evaluate_alerts
from .services.outbox import requeue_dead_letter
from .services.tenancy import get_current_application, get_current_tenant, scope_queryset
from .notification_forms import AudienceConditionForm, DynamicAudienceForm, NotificationRuleForm
from apps.notifications.notification_forms import ( NotificationTemplateForm, NotificationTemplateVersionForm,)
from django.http import HttpResponseBadRequest
from django.views.decorators.http import require_POST
from .notification_forms import BulkActionForm, SavedViewForm, RecommendationFeedbackForm
from .services.bulk_actions import apply_bulk_action
from .services.saved_views import save_view
from .services.correlation import explore
from .services.object_timeline import source_object_timeline
from .services.domain_analytics import (campaign_analytics, audience_analytics, fatigue_analytics, unread_aging,)
from .services.explanations import explain_notification
from .services.recommendation_learning import record_feedback, quality_summary
from .services.insights import generate_insights
from .services.tenancy import get_current_tenant





def _staff_required(view):
    return login_required(user_passes_test(lambda user: user.is_staff)(view))


def _page(request, queryset, per_page=25):
    return Paginator(queryset, per_page).get_page(request.GET.get("page"))


def _tenant_queryset(queryset):
    """Apply tenant and application isolation when multi-tenancy is enabled."""
    if not settings.MULTI_TENANCY_ENABLED:
        return queryset
    tenant = get_current_tenant()
    application = get_current_application()
    if tenant is None:
        return queryset.none()
    return scope_queryset(queryset, tenant=tenant, application=application)


def _audience_queryset():
    return _tenant_queryset(
        DynamicAudience.objects.select_related("tenant", "application", "created_by")
        .prefetch_related("conditions", "snapshots")
    )


def _delivery_queryset():
    queryset = NotificationDelivery.objects.select_related(
        "notification",
        "notification__recipient",
        "notification__tenant",
        "notification__application",
    )
    if not settings.MULTI_TENANCY_ENABLED:
        return queryset
    tenant = get_current_tenant()
    application = get_current_application()
    if tenant is None:
        return queryset.none()
    queryset = queryset.filter(notification__tenant=tenant)
    if application is not None:
        queryset = queryset.filter(notification__application=application)
    return queryset


def _dead_letter_queryset():
    return _tenant_queryset(
        NotificationDeadLetter.objects.select_related(
            "notification", "notification__recipient", "outbox_event", "tenant", "application"
        )
    )


def _outbox_queryset():
    return _tenant_queryset(
        NotificationOutbox.objects.select_related("notification", "tenant", "application")
    )


@_staff_required
@require_http_methods(["GET", "POST"])
def audiences(request):
    queryset = _audience_queryset().order_by("name", "id")
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "").strip()
    if query:
        queryset = queryset.filter(Q(name__icontains=query) | Q(description__icontains=query))
    if status == "active":
        queryset = queryset.filter(is_active=True)
    elif status == "inactive":
        queryset = queryset.filter(is_active=False)

    form = DynamicAudienceForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        audience = form.save(commit=False)
        audience.tenant = get_current_tenant()
        audience.created_by = request.user
        if audience.application_id and audience.tenant_id:
            if audience.application.tenant_id != audience.tenant_id:
                form.add_error("application", "Application must belong to the current tenant.")
            else:
                audience.save()
                messages.success(request, "Audience created.")
                return redirect("notifications:audience_detail", pk=audience.pk)
        else:
            audience.save()
            messages.success(request, "Audience created.")
            return redirect("notifications:audience_detail", pk=audience.pk)

    page_obj = _page(request, queryset, 18)
    snapshot_total = sum(a.snapshots.count() for a in page_obj.object_list)
    member_total = sum(s.member_count for a in page_obj.object_list for s in a.snapshots.all())
    context = {
        "active_nav": "audiences",
        "audiences": page_obj.object_list,
        "page_obj": page_obj,
        "audience_form": form,
        "audience_metrics": {
            "active": queryset.filter(is_active=True).count(),
            "snapshots": snapshot_total,
            "members": member_total,
            "campaign_linked": sum(1 for a in page_obj.object_list for s in a.snapshots.all() if s.campaign_id),
        },
    }
    return render(request, "gdx_admin/apps/notifications/audiences/audiences.html", context)


@_staff_required
@require_http_methods(["GET", "POST"])
def audience_detail(request, pk):
    audience = get_object_or_404(_audience_queryset(), pk=pk)
    condition = audience.conditions.model(audience=audience)
    form = AudienceConditionForm(request.POST or None, instance=condition)
    if request.method == "POST" and request.POST.get("action") == "add_condition" and form.is_valid():
        form.save()
        messages.success(request, "Audience condition added.")
        return redirect("notifications:audience_detail", pk=audience.pk)
    context = {
        "active_nav": "audiences",
        "audience": audience,
        "snapshots": audience.snapshots.select_related("campaign").order_by("-created_at"),
        "condition_form": form,
    }
    return render(request, "gdx_admin/apps/notifications/audiences/audience_detail.html", context)


@login_required
@require_http_methods(["GET", "POST"])
def rules(request):
    queryset = NotificationRule.objects.filter(user=request.user).select_related(
        "tenant", "application"
    ).order_by("priority", "id")
    if settings.MULTI_TENANCY_ENABLED:
        queryset = _tenant_queryset(queryset)

    form = NotificationRuleForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        rule = form.save(commit=False)
        rule.user = request.user
        rule.tenant = get_current_tenant()
        if rule.application_id and rule.tenant_id and rule.application.tenant_id != rule.tenant_id:
            form.add_error("application", "Application must belong to the current tenant.")
        else:
            rule.save()
            messages.success(request, "Notification rule created.")
            return redirect("notifications:rules")

    page_obj = _page(request, queryset)
    return render(
        request,
        "gdx_admin/apps/notifications/governance/rules.html",
        {
            "active_nav": "rules",
            "rules": page_obj.object_list,
            "page_obj": page_obj,
            "rule_form": form,
        },
    )


@login_required
@require_http_methods(["GET", "POST"])
def rule_edit(request, pk):
    queryset = NotificationRule.objects.filter(user=request.user)
    if settings.MULTI_TENANCY_ENABLED:
        queryset = _tenant_queryset(queryset)
    rule = get_object_or_404(queryset, pk=pk)
    form = NotificationRuleForm(request.POST or None, instance=rule)
    if request.method == "POST" and form.is_valid():
        updated = form.save(commit=False)
        if updated.application_id and updated.tenant_id and updated.application.tenant_id != updated.tenant_id:
            form.add_error("application", "Application must belong to the current tenant.")
        else:
            updated.save()
            messages.success(request, "Notification rule updated.")
            return redirect("notifications:rules")
    return render(
        request,
        "gdx_admin/apps/notifications/governance/rule_form.html",
        {"active_nav": "rules", "rule": rule, "rule_form": form},
    )


@login_required
@require_POST
def rule_delete(request, pk):
    queryset = NotificationRule.objects.filter(user=request.user)
    if settings.MULTI_TENANCY_ENABLED:
        queryset = _tenant_queryset(queryset)
    rule = get_object_or_404(queryset, pk=pk)
    rule.delete()
    messages.success(request, "Notification rule deleted.")
    return redirect("notifications:rules")


@_staff_required
@require_GET
def deliveries(request):
    queryset = _delivery_queryset().order_by("-created_at", "-id")
    query = request.GET.get("q", "").strip()
    channel = request.GET.get("channel", "").strip()
    status = request.GET.get("status", "").strip()
    if query:
        queryset = queryset.filter(
            Q(notification__title__icontains=query)
            | Q(notification__correlation_id__icontains=query)
            | Q(failure_code__icontains=query)
            | Q(failure_summary__icontains=query)
        )
    if channel in DeliveryChannel.values:
        queryset = queryset.filter(channel=channel)
    if status in DeliveryStatus.values:
        queryset = queryset.filter(status=status)

    metrics_source = _delivery_queryset()
    metrics = {
        "pending": metrics_source.filter(status=DeliveryStatus.PENDING).count(),
        "processing": metrics_source.filter(status=DeliveryStatus.PROCESSING).count(),
        "delivered": metrics_source.filter(status=DeliveryStatus.DELIVERED).count(),
        "failed": metrics_source.filter(status=DeliveryStatus.FAILED).count(),
    }
    page_obj = _page(request, queryset)
    return render(
        request,
        "gdx_admin/apps/notifications/deliveries/deliveries.html",
        {
            "active_nav": "deliveries",
            "deliveries": page_obj.object_list,
            "page_obj": page_obj,
            "delivery_metrics": metrics,
            "delivery_channels": DeliveryChannel.choices,
            "delivery_statuses": DeliveryStatus.choices,
        },
    )


@_staff_required
@require_GET
def delivery_detail(request, pk):
    delivery = get_object_or_404(
        _delivery_queryset().prefetch_related("push_receipts", "push_receipts__device"), pk=pk
    )
    return render(
        request,
        "gdx_admin/apps/notifications/deliveries/delivery_detail.html",
        {"active_nav": "deliveries", "delivery": delivery},
    )


@_staff_required
@require_GET
def admin_operations(request):
    outbox = _outbox_queryset()
    dead_letters_qs = _dead_letter_queryset()
    actionable = outbox.filter(
        status__in=[OutboxStatus.PENDING, OutboxStatus.FAILED, OutboxStatus.PROCESSING]
    ).order_by("available_at", "created_at")
    verification = AuditLedgerVerification.objects.order_by("-completed_at", "-id").first()
    report = evaluate_alerts()
    context = {
        "active_nav": "admin_operations",
        "health": {
            "has_alerts": bool(report["alerts"]),
            "summary": "Monitoring thresholds currently require review."
            if report["alerts"]
            else "No configured monitoring alert is active.",
            "checked_at": timezone.now(),
        },
        "ops": {
            "outbox_backlog": outbox.filter(
                status__in=[OutboxStatus.PENDING, OutboxStatus.FAILED]
            ).count(),
            "processing": outbox.filter(status=OutboxStatus.PROCESSING).count(),
            "dead_letters": dead_letters_qs.filter(status=DeadLetterStatus.OPEN).count(),
            "ledger_status": verification.status if verification else "unknown",
            "ledger_checked_entries": verification.checked_entries if verification else 0,
        },
        "outbox_events": actionable[:20],
        "alerts": report["alerts"],
        "ledger_verification": verification,
    }
    return render(request, "gdx_admin/apps/notifications/governance/admin_operations.html", context)


@_staff_required
@require_GET
def dead_letters(request):
    queryset = _dead_letter_queryset().order_by("-created_at", "-id")
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "").strip()
    if query:
        queryset = queryset.filter(
            Q(failure_code__icontains=query)
            | Q(failure_reason__icontains=query)
            | Q(notification__correlation_id__icontains=query)
            | Q(notification__title__icontains=query)
        )
    if status in DeadLetterStatus.values:
        queryset = queryset.filter(status=status)
    page_obj = _page(request, queryset)
    return render(
        request,
        "gdx_admin/apps/notifications/deliveries/dead_letters.html",
        {
            "active_nav": "admin_operations",
            "dead_letters": page_obj.object_list,
            "page_obj": page_obj,
        },
    )


@_staff_required
@require_POST
def dead_letter_requeue(request, pk):
    item = get_object_or_404(_dead_letter_queryset(), pk=pk, status=DeadLetterStatus.OPEN)
    requeue_dead_letter(item, actor=request.user)
    messages.success(request, "Dead-letter event requeued.")
    return redirect("notifications:dead_letters")


@_staff_required
@require_GET
def audit_ledger(request):
    entries = AuditLedgerEntry.objects.order_by("-sequence")
    query = request.GET.get("q", "").strip()
    if query:
        entries = entries.filter(
            Q(event_type__icontains=query)
            | Q(aggregate_type__icontains=query)
            | Q(aggregate_id__icontains=query)
            | Q(correlation_id__icontains=query)
        )
    page_obj = _page(request, entries, 50)
    verification = AuditLedgerVerification.objects.order_by("-completed_at", "-id").first()
    return render(
        request,
        "gdx_admin/apps/notifications/governance/audit_ledger.html",
        {
            "active_nav": "admin_operations",
            "entries": page_obj.object_list,
            "page_obj": page_obj,
            "ledger_verification": verification,
        },
    )


def _inbox(request, unread_only=False):
    notifications = Notification.objects.filter(recipient=request.user, is_deleted=False)
    status = "unread" if unread_only else (request.GET.get("status") or "")
    if status == "unread":
        notifications = notifications.filter(read=False)
    elif status == "read":
        notifications = notifications.filter(read=True)
    kind = (request.GET.get("type") or "").strip()
    if kind:
        notifications = notifications.filter(notification_type=kind)
    query = (request.GET.get("q") or "").strip()
    if query:
        notifications = notifications.filter(Q(title__icontains=query) | Q(body__icontains=query))
    return notifications.prefetch_related("deliveries").order_by("-created_at")


def _list_page(request, unread_only=False):
    inbox = Notification.objects.filter(recipient=request.user, is_deleted=False)
    page_obj = Paginator(_inbox(request, unread_only), 25).get_page(request.GET.get("page"))
    for item in page_obj.object_list:
        by_channel = {delivery.channel: delivery for delivery in item.deliveries.all()}
        item.in_app_delivery = by_channel.get(DeliveryChannel.IN_APP)
        item.email_delivery = by_channel.get(DeliveryChannel.EMAIL)
    unread = inbox.filter(read=False).count()
    return {
        "notifications": page_obj.object_list,
        "page_obj": page_obj,
        "active_nav": "notifications",
        "notification_types": NotificationType.choices,
        "staff_page_kicker": "NOTIFICATIONS",
        "staff_page_title": "Notifications",
        "staff_page_description": "In-app and email notices for your account. Approvals, alerts, and other messages land here.",
        "staff_page_icon": "▦",
        "staff_page_metric_label": "Your inbox",
        "staff_page_metric_value": str(unread),
        "staff_page_metric_caption": "unread notifications",
        "staff_page_heading": "Your notifications",
        "staff_page_heading_text": "Filter by approval to see what is waiting on you.",
        "staff_page_mark_read": True,
    }


@login_required
def notification_list(request):
    return render(request, "gdx_admin/apps/notifications/settings/notification_list.html", _list_page(request))


@login_required
def unread_notifications(request):
    return render(request, "gdx_admin/apps/notifications/settings/notification_list.html", _list_page(request, unread_only=True))


@login_required
@require_POST
def mark_all_read(request):
    (
        Notification.objects
        .filter(
            recipient=request.user,
            read=False,
        )
        .update(
            read=True,
            read_at=timezone.now(),
        )
    )

    messages.success(
        request,
        "All notifications marked read.",
    )

    next_url = request.POST.get("next") or ""
    if not next_url.startswith("/") or next_url.startswith("//"):
        next_url = ""
    return redirect(next_url or "notifications:list")


@login_required
@require_POST
def toggle_read(request, notification_id):
    notification = get_object_or_404(
        Notification,
        pk=notification_id,
        recipient=request.user,
    )

    notification.read = not notification.read

    if notification.read:
        notification.read_at = timezone.now()
    else:
        notification.read_at = None

    notification.save(
        update_fields=[
            "read",
            "read_at",
        ]
    )

    return redirect("notifications:list")


class NotificationPreferenceForm(forms.ModelForm):
    class Meta:
        model = NotificationPreference
        exclude = ("user",)
        labels = {
            "in_app_enabled": "In-app",
            "email_enabled": "Email",
            "teams_enabled": "Teams",
            "mobile_push_enabled": "Mobile push",
            "approval_enabled": "Approvals",
            "assignment_enabled": "Assignments",
            "comment_enabled": "Comments",
            "governance_enabled": "Governance",
            "system_enabled": "System",
            "security_enabled": "Security",
            "digest_frequency": "Frequency",
            "digest_hour": "Delivery hour",
        }
        widgets = {
            "digest_frequency": forms.Select(attrs={"class": "form-select", "id": "digest-frequency"}),
            "digest_hour": forms.NumberInput(attrs={"class": "form-control", "id": "digest-hour", "min": 0, "max": 23}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if isinstance(field, forms.BooleanField):
                field.widget.attrs["class"] = "form-check-input"
                field.widget.attrs["role"] = "switch"

    def clean(self):
        cleaned = super().clean()
        if not cleaned.get("email_enabled"):
            cleaned["digest_frequency"] = "off"
        return cleaned


@login_required
@require_http_methods(["GET", "POST"])
def preferences(request):

    preference, _ = NotificationPreference.objects.get_or_create(
        user=request.user
    )

    form = NotificationPreferenceForm(
        request.POST or None,
        instance=preference,
    )

    if request.method == "POST" and form.is_valid():
        form.save()

        messages.success(
            request,
            "Preferences updated.",
        )

        return redirect(
            "notifications:preferences"
        )

    return render(
        request,
        "gdx_admin/apps/notifications/settings/preferences.html",
        {
            "preference_form": form,
            "active_nav": "settings",
            "staff_page_kicker": "NOTIFICATIONS",
            "staff_page_title": "Notification preferences",
            "staff_page_description": "Choose which channels reach you, which categories you want, and when an email digest is sent.",
            "staff_page_icon": "▦",
            "staff_page_metric_label": "Digest",
            "staff_page_metric_value": preference.get_digest_frequency_display(),
            "staff_page_metric_caption": "email schedule" if preference.email_enabled else "email is off",
            "staff_page_heading": "Delivery preferences",
            "staff_page_heading_text": "In-app notices stay in your inbox. A digest is emailed only when Email is enabled.",
        },
    )



@user_passes_test(lambda u: u.is_staff)
@require_http_methods(["GET", "POST"])
def campaign_manager(request):

    form = CampaignForm(
        request.POST or None
    )

    if request.method == "POST" and form.is_valid():

        campaign = form.save(
            commit=False
        )

        campaign.created_by = request.user

        campaign.save()

        messages.success(
            request,
            "Campaign created.",
        )

        return redirect(
            "notifications:campaign_manager"
        )

    campaigns = (
        NotificationCampaign.objects
        .order_by("-created_at")
    )

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/campaigns.html",
        {
            "campaign_form": form,
            "campaigns": campaigns,
            "active_nav": "campaigns",
        },
    )



@login_required
def teams_destination(request):

    destination = (
        TeamsDestination.objects
        .filter(user=request.user)
        .first()
    )

    return render(
        request,
        "gdx_admin/apps/notifications/settings/teams.html",
        {
            "destination": destination,
            "active_nav": "settings",
        },
    )


@user_passes_test(lambda u: u.is_staff)
def template_manager(request):

    templates = (
        NotificationTemplate.objects
        .prefetch_related("versions")
        .order_by("key")
    )

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/templates.html",
        {
            "templates": templates,
            "active_nav": "templates",
        },
    )


@login_required
def summaries(request):

    summaries = (
        NotificationSummary.objects
        .filter(user=request.user)
        .order_by("-created_at")
    )

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/summaries.html",
        {
            "summaries": summaries,
            "active_nav": "summaries",
        },
    )


@login_required
def push_devices(request):

    devices = (
        PushDevice.objects
        .filter(user=request.user)
        .order_by("-last_seen_at")
    )

    return render(
        request,
        "gdx_admin/apps/notifications/deliveries/push_devices.html",
        {
            "devices": devices,
            "active_nav": "devices",
        },
    )


@user_passes_test(lambda u: u.is_staff)
def fatigue_bundles(request):

    bundles = (
        NotificationBundle.objects
        .prefetch_related(
            "notifications"
        )
        .order_by("-created_at")
    )

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/fatigue_bundles.html",
        {
            "bundles": bundles,
            "active_nav": "bundles",
        },
    )


@login_required
def sse_notifications(request):

    def event_stream():

        while True:

            yield (
                "event: ping\\n"
                "data: alive\\n\\n"
            )

            time.sleep(10)

    response = StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream",
    )

    response["Cache-Control"] = "no-cache"

    return response


class CampaignForm(forms.ModelForm):
    class Meta:
        model = NotificationCampaign
        fields = [
            "name",
            "description",
            "scheduled_at",
            "notification_type",
            "audience_type",
        ]

        widgets = {
            "scheduled_at": forms.DateTimeInput(
                attrs={"type": "datetime-local"}
            )
        }













def template_create(request):
    template_form = NotificationTemplateForm(request.POST or None)
    version_form = NotificationTemplateVersionForm(request.POST or None)
    builder_schema = request.POST.get(
        "builder_schema",
        "[]"
    )

    if (
        request.method == "POST"
        and template_form.is_valid()
        and version_form.is_valid()
    ):

        try:
            schema = json.loads(builder_schema)

            if not isinstance(schema, list):
                raise ValueError("Builder schema must be a list.")

            if not schema:
                raise ValueError(
                    "At least one content block is required."
                )

        except (ValueError, json.JSONDecodeError) as exc:
            version_form.add_error(None, str(exc),)

        else:
            save_mode = request.POST.get("save_mode", "draft",)
            template = template_form.save(commit=False)

            if save_mode == "activate":
                template.status = "active"
            else:
                template.status = "draft"

            template.save()
            version = version_form.save(commit=False)
            version.template = template
            version.builder_schema = schema
            version.save()
            messages.success(request,"Notification template created.",)

            return redirect("notifications:template_detail", pk=template.pk,)

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/template_create.html",
        {
            "template_form": template_form,
            "version_form": version_form,
            "builder_schema": builder_schema,
        },
    )


class NotificationTemplateVersionForm(forms.Form):
    version_name = forms.CharField(
        label="Version Name",
        max_length=100,
        required=True,
        help_text="Human-readable version label."
    )

    locale = forms.CharField(
        label="Locale",
        max_length=20,
        initial="en-US",
        required=True,
    )

    subject = forms.CharField(
        label="Subject",
        max_length=255,
        required=False,
    )

    preheader = forms.CharField(
        label="Preheader",
        max_length=255,
        required=False,
    )

    email_html = forms.CharField(
        label="Email HTML",
        widget=forms.Textarea(attrs={"rows": 10}),
        required=False,
    )

    email_text = forms.CharField(
        label="Email Text",
        widget=forms.Textarea(attrs={"rows": 8}),
        required=False,
    )

    sms_body = forms.CharField(
        label="SMS Content",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    push_title = forms.CharField(
        label="Push Title",
        max_length=200,
        required=False,
    )

    push_body = forms.CharField(
        label="Push Body",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    in_app_title = forms.CharField(
        label="In-App Title",
        max_length=200,
        required=False,
    )

    in_app_body = forms.CharField(
        label="In-App Body",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    teams_title = forms.CharField(
        label="Teams Title",
        max_length=200,
        required=False,
    )

    teams_body = forms.CharField(
        label="Teams Message",
        widget=forms.Textarea(attrs={"rows": 6}),
        required=False,
    )

    digest_section_title = forms.CharField(
        label="Digest Section Title",
        max_length=200,
        required=False,
    )

    digest_content = forms.CharField(
        label="Digest Content",
        widget=forms.Textarea(attrs={"rows": 8}),
        required=False,
    )

    changelog = forms.CharField(
        label="Version Notes",
        widget=forms.Textarea(attrs={"rows": 3}),
        required=False,
    )

    is_default = forms.BooleanField(
        label="Default Version",
        required=False,
    )

    activate_on_save = forms.BooleanField(
        label="Activate Version",
        required=False,
    )

    def clean(self):
        cleaned = super().clean()

        if not any(
            [
                cleaned.get("email_html"),
                cleaned.get("email_text"),
                cleaned.get("sms_body"),
                cleaned.get("push_body"),
                cleaned.get("in_app_body"),
                cleaned.get("teams_body"),
                cleaned.get("digest_content"),
            ]
        ):
            raise forms.ValidationError("At least one channel content field must be populated.")

        return cleaned

@user_passes_test(lambda u: u.is_staff)
def template_detail(request, pk):
    template = get_object_or_404(
        NotificationTemplate.objects.prefetch_related("versions"),
        pk=pk,
    )

    return render(
        request,
        "gdx_admin/apps/notifications/campaigns/template_detail.html",
        {
            "template": template,
            "active_nav": "templates",
        },
    )


















@login_required
@require_POST
def bulk_action(request):
    f = BulkActionForm(request.POST)
    if not f.is_valid():
        return HttpResponseBadRequest(f.errors.as_json())
    apply_bulk_action(user=request.user, actor=request.user, **f.cleaned_data)
    return redirect("notifications:master_center")


@login_required
@require_POST
def save_current_view(request):
    f = SavedViewForm(request.POST)
    if not f.is_valid():
        return HttpResponseBadRequest(f.errors.as_json())
    save_view(
        tenant=get_current_tenant(),
        user=request.user,
        name=f.cleaned_data["name"],
        is_default=f.cleaned_data["is_default"],
        filters=request.POST,
    )
    return redirect("notifications:master_center")


@login_required
def correlation_explorer(request):
    value = request.GET.get("correlation_id", "")
    data = explore(value, user=request.user) if value else None
    return render(
        request,
        "gdx_admin/apps/notifications/master/correlation.html",
        {"title": "Correlation Explorer", "data": data, "correlation_id": value},
    )


@login_required
def object_timeline(request, object_type, object_id):
    return render(
        request,
        "gdx_admin/apps/notifications/master/object_timeline.html",
        {
            "title": "Object Activity Timeline",
            "object_type": object_type,
            "object_id": object_id,
            "items": source_object_timeline(
                user=request.user, object_type=object_type, object_id=object_id
            ),
        },
    )


@user_passes_test(lambda u: u.is_staff)
def advanced_analytics(request):
    return render(
        request,
        "gdx_admin/apps/notifications/master/advanced_analytics.html",
        {
            "title": "Advanced Notification Analytics",
            "campaigns": campaign_analytics(),
            "audiences": audience_analytics(),
            "fatigue": fatigue_analytics(),
            "aging": unread_aging(),
            "recommendation_quality": quality_summary(get_current_tenant()),
        },
    )


@login_required
def explain(request, pk):
    n = get_object_or_404(Notification.objects.for_user(request.user).active(), pk=pk)
    return render(
        request,
        "gdx_admin/apps/notifications/master/explain.html",
        {
            "title": "Notification Explanation",
            "notification": n,
            "explanation": explain_notification(n),
        },
    )


@login_required
@require_POST
def recommendation_feedback(request, pk):
    r = get_object_or_404(
        NotificationRecommendation,
        tenant=get_current_tenant(),
        recipient=request.user,
        pk=pk,
    )
    f = RecommendationFeedbackForm(request.POST)
    if not f.is_valid():
        return HttpResponseBadRequest(f.errors.as_json())
    record_feedback(recommendation=r, user=request.user, **f.cleaned_data)
    return redirect("notifications:recommendations")


@user_passes_test(lambda u: u.is_staff)
@require_POST
def generate_communication_insights(request):
    generate_insights()
    return redirect("notifications:master_advanced_analytics")
