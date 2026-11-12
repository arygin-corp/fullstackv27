from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F, Q
from django.http import JsonResponse
from django.utils.html import escape
from django.views.generic import TemplateView

from .models import Request, Task


def _text(value):
    return escape(value or "")


def _date(value):
    return value.strftime("%d %B, %Y") if value else ""


_STATE_BADGES = {
    "open": "badge-soft-info me-1 badge badge-soft-info-custom",
    "pending": "badge-soft-dark me-1 badge badge-soft-dark-custom",
    "work in progress": "badge-soft-primary me-2 badge badge-soft-primary-custom",
    "closed complete": "badge-soft-success me-1 badge badge-soft-success-custom",
    "completed": "badge-soft-success me-1 badge badge-soft-success-custom",
    "closed incomplete": "badge-soft-danger me-1 badge badge-soft-danger-custom",
    "closed skipped": "badge-soft-dark me-1 badge badge-soft-dark-custom",
    "request cancelled": "badge-soft-danger me-1 badge badge-soft-danger-custom",
    "waiting for approval": "badge-soft-warning me-1 badge badge-soft-warning-custom",
    "reopened": "badge-soft-primary me-2 badge badge-soft-primary-custom",
    "fulfillment": "badge-soft-primary me-2 badge badge-soft-primary-custom",
    "fulfilment": "badge-soft-primary me-2 badge badge-soft-primary-custom",
}


def _state_badge(value):
    label = (value or "").strip()
    if not label:
        return ""
    css = _STATE_BADGES.get(label.lower(), "badge bg-secondary text-white")
    return (
        f'<span class="{css}" style="font-size: 12px !important; padding: 4px 12px !important;">'
        f"{escape(label)}</span>"
    )


class StaffTablePage(LoginRequiredMixin, TemplateView):
    page_title = ""
    count_key = ""
    record_model = None
    search_fields = ()
    status_field = ""
    order_by = ("-id",)

    def get(self, request, *args, **kwargs):
        if "draw" in request.GET:
            return self.table_response()
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        records = self.record_model.objects.all()
        statuses = (
            records.exclude(**{self.status_field: ""})
            .values_list(self.status_field, flat=True)
            .distinct()
            .order_by(self.status_field)
        )
        context.update(
            {
                "heading": self.page_title,
                "heading2": self.page_title,
                "pageview": "Request",
                "current_per_page": 25,
                self.count_key: records.count(),
                "status_choices": list(statuses),
            }
        )
        return context

    def queryset(self):
        records = self.record_model.objects.all()
        query = (self.request.GET.get("q") or "").strip()
        if query and self.search_fields:
            lookup = Q()
            for field in self.search_fields:
                lookup |= Q(**{f"{field}__icontains": query})
            records = records.filter(lookup)
        status = (self.request.GET.get("status") or "").strip()
        if status and status != "all":
            records = records.filter(**{self.status_field: status})
        return records.order_by(*self.order_by)

    def table_response(self):
        draw = int(self.request.GET.get("draw") or 1)
        start = int(self.request.GET.get("start") or 0)
        length = int(self.request.GET.get("length") or 25)
        records = self.queryset()
        total = records.count()
        page = records[start:start + length]
        return JsonResponse(
            {
                "draw": draw,
                "recordsTotal": total,
                "recordsFiltered": total,
                "data": [self.row(record) for record in page],
            }
        )

    def row(self, record):
        return {}


class RequestTableView(StaffTablePage):
    template_name = "gdx_users/apps/orders/requests/index.html"
    page_title = "Requests"
    count_key = "total_requests_count"
    record_model = Request
    search_fields = ("number", "ritm_number", "product_id", "stage", "approval_stage", "ritm_state")
    status_field = "stage"
    order_by = (F("opened_at").desc(nulls_last=True), "-id")

    def queryset(self):
        return super().queryset().select_related("marketplace_order")

    def row(self, record):
        return {
            "id": record.id,
            "number": _text(record.number),
            "ritm": _text(record.ritm_number),
            "product": _text(record.product_id),
            "stage": _state_badge(record.stage),
            "approval": _text(record.approval_stage),
            "state": _state_badge(record.ritm_state),
            "opened": _date(record.opened_at),
        }


class TaskTableView(StaffTablePage):
    template_name = "gdx_users/apps/orders/tasks/index.html"
    page_title = "Tasks"
    count_key = "total_tasks_count"
    record_model = Task
    search_fields = ("number", "ritm", "state", "assignment_group", "assigned_to", "request__number")
    status_field = "state"
    order_by = ("-created", "-id")

    def queryset(self):
        return super().queryset().select_related("request")

    def row(self, record):
        return {
            "id": record.id,
            "number": _text(record.number),
            "ritm": _text(record.ritm),
            "request": _text(record.request.number if record.request_id else ""),
            "state": _state_badge(record.state),
            "group": _text(record.assignment_group),
            "assigned": _text(record.assigned_to),
            "created": _date(record.created),
        }
