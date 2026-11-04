import csv
import json
from datetime import datetime, time

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import StreamingHttpResponse
from django.utils import timezone
from django.views.generic import DetailView, ListView

from .models import AuditLog, Post

POST_MODEL = "changelog.post"
CATEGORY_MODEL = "changelog.categorie"
MAX_EXPORT_ROWS = 50000


def csv_safe(value):
    """Prevent spreadsheet formula execution when a CSV is opened."""
    text = "" if value is None else str(value)
    return "'" + text if text[:1] in {"=", "+", "-", "@"} else text


class Echo:
    def write(self, value):
        return value


def parse_date(value, end=False):
    if not value:
        return None
    parsed = datetime.strptime(value, "%Y-%m-%d").date()
    moment = datetime.combine(parsed, time.max if end else time.min)
    return timezone.make_aware(moment, timezone.get_current_timezone())


def filtered_audit_queryset(params):
    queryset = AuditLog.objects.select_related("actor").all()

    model_name = (params.get("model") or "").strip()
    if model_name in {POST_MODEL, CATEGORY_MODEL}:
        queryset = queryset.filter(model_name=model_name)

    action = (params.get("action") or "").strip().upper()
    if action in AuditLog.Action.values:
        queryset = queryset.filter(action=action)

    username = (params.get("user") or "").strip()
    if username:
        queryset = queryset.filter(actor_username__icontains=username)

    version = (params.get("version") or "").strip()
    if version:
        post_ids = Post.objects.filter(version__icontains=version).values_list("pk", flat=True)
        queryset = queryset.filter(model_name=POST_MODEL, object_id__in=[str(pk) for pk in post_ids])

    object_id = (params.get("object_id") or "").strip()
    if object_id:
        queryset = queryset.filter(object_id=object_id)

    query = (params.get("q") or "").strip()
    if query:
        from django.db.models import Q
        queryset = queryset.filter(
            Q(object_repr__icontains=query)
            | Q(actor_username__icontains=query)
            | Q(request_path__icontains=query)
        )

    try:
        start = parse_date(params.get("start_date"))
        end = parse_date(params.get("end_date"), end=True)
    except ValueError:
        start = end = None
    if start:
        queryset = queryset.filter(created_at__gte=start)
    if end:
        queryset = queryset.filter(created_at__lte=end)
    return queryset.order_by("-created_at", "-pk")


def resolve_versions(logs):
    ids = {
        int(log.object_id) for log in logs
        if log.model_name == POST_MODEL and str(log.object_id).isdigit()
    }
    return dict(Post.objects.filter(pk__in=ids).values_list("pk", "version"))


def display_changes(log):
    items = []
    changes = log.changes if isinstance(log.changes, dict) else {}
    for field, values in changes.items():
        values = values if isinstance(values, dict) else {"from": None, "to": values}
        items.append({
            "field": field,
            "before": values.get("from"),
            "after": values.get("to"),
        })
    return items


class AuditLogListView(LoginRequiredMixin, PermissionRequiredMixin, ListView):
    permission_required = "changelog.view_all_audit_logs"
    raise_exception = True
    template_name = "gdx_admin/apps/changelog/audit/audit_list.html"
    context_object_name = "audit_logs"
    paginate_by = 50

    def get_queryset(self):
        return filtered_audit_queryset(self.request.GET)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        logs = list(context["audit_logs"])
        versions = resolve_versions(logs)
        context["audit_rows"] = [
            {"log": log, "version": versions.get(int(log.object_id)) if log.model_name == POST_MODEL and log.object_id.isdigit() else "", "change_count": len(log.changes or {})}
            for log in logs
        ]
        context["actions"] = AuditLog.Action.choices
        context["model_choices"] = [(POST_MODEL, "Release"), (CATEGORY_MODEL, "Category")]
        query = self.request.GET.copy()
        query.pop("page", None)
        context["filter_query"] = query.urlencode()
        return context


class AuditLogDetailView(LoginRequiredMixin, PermissionRequiredMixin, DetailView):
    permission_required = "changelog.view_all_audit_logs"
    raise_exception = True
    model = AuditLog
    template_name = "gdx_admin/apps/changelog/audit/audit_detail.html"
    context_object_name = "audit_log"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["field_changes"] = display_changes(self.object)
        if self.object.model_name == POST_MODEL and self.object.object_id.isdigit():
            context["release"] = Post.objects.filter(pk=int(self.object.object_id)).first()
        return context


class AuditLogExportView(LoginRequiredMixin, PermissionRequiredMixin, DetailView):
    permission_required = "changelog.view_all_audit_logs"
    raise_exception = True

    def get(self, request, *args, **kwargs):
        queryset = filtered_audit_queryset(request.GET)[:MAX_EXPORT_ROWS]
        versions = resolve_versions(queryset)
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)

        def rows():
            yield writer.writerow([
                "timestamp", "user", "email", "action", "model", "object_id",
                "release_version", "object", "field", "before", "after",
                "request_method", "request_path", "ip_address",
            ])
            for log in queryset.iterator(chunk_size=1000):
                version = versions.get(int(log.object_id), "") if log.model_name == POST_MODEL and log.object_id.isdigit() else ""
                changes = display_changes(log) or [{"field": "", "before": "", "after": ""}]
                for change in changes:
                    yield writer.writerow([
                        csv_safe(log.created_at.isoformat()), csv_safe(log.actor_username), csv_safe(log.actor_email),
                        csv_safe(log.action), csv_safe(log.model_name), csv_safe(log.object_id), csv_safe(version),
                        csv_safe(log.object_repr), csv_safe(change["field"]),
                        csv_safe(json.dumps(change["before"], ensure_ascii=False, default=str)),
                        csv_safe(json.dumps(change["after"], ensure_ascii=False, default=str)),
                        csv_safe(log.request_method), csv_safe(log.request_path), csv_safe(log.ip_address or ""),
                    ])

        response = StreamingHttpResponse(rows(), content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="changelog-audit.csv"'
        response["X-Content-Type-Options"] = "nosniff"
        return response
