import json
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models.functions import TruncDay
from django.utils import timezone
from django.db.models import (Avg, Count, DurationField, ExpressionWrapper, F, Min, Q,)
from django.views.generic import DetailView, ListView, TemplateView
from .models import SyncCursor
from apps.orders.models import (MarketplaceOrder, ServiceNowSyncAudit,)
from apps.orders.models import Request, Task
from datetime import datetime, time, timedelta
from django.views.generic import TemplateView
from .health_context import SyncHealthContextMixin


class StaffRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self): return self.request.user.is_staff


class OrdersDashboardView(TemplateView):
    template_name = "gdx_admin/apps/orders/dashboard/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["total_orders"] = Request.objects.count()
        context["total_requests"] = Request.objects.count()
        context["total_tasks"] = Task.objects.count()
        context["open_requests"] = Request.objects.filter(closed_at__isnull=True).count()
        context["pending_orders"] = MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.PENDING).count()
        context["processing_orders"] = MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.PROCESSING).count()
        context["synchronized_orders"] = MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.SYNCHRONIZED).count()
        context["failed_orders"] = MarketplaceOrder.objects.filter(sync_status=MarketplaceOrder.SyncStatus.FAILED).count()
        context["recent_audits"] = (ServiceNowSyncAudit.objects.select_related("marketplace_order").order_by("-started_at")[:10])
        context["pending_tasks"] = Task.objects.filter(Q(state__icontains="pending") | Q(state__icontains="open")).count()

        context["sync_failures"] = ServiceNowSyncAudit.objects.filter(status="FAILED").count()
        context["sync_failures"] = ServiceNowSyncAudit.objects.filter(status__in=["FAILED", "QUARANTINED"]).count()

        context["polling_cursor"] = (
                SyncCursor.objects.filter(name="servicenow-orders").first() or SyncCursor(name="servicenow-orders",cursor="Not configured",last_status="Unknown")
        )
        cursor = SyncCursor.objects.filter(name="servicenow-orders").first()

        context["polling_cursor"] = cursor
        context["polling_cursor_value"] = (cursor.cursor if cursor else "Not Available")

        return context

class OrderListView(StaffRequiredMixin, ListView):
    model = Request
    template_name = "gdx_admin/apps/orders/orders/order_list.html"
    context_object_name = "orders"
    paginate_by = 25

    def get_queryset(self):
        queryset = (
            Request.objects
            .select_related("marketplace_order")
            .prefetch_related("tasks")
            .order_by("-opened_at", "-id")
        )

        search = self.request.GET.get("q", "").strip()
        status = self.request.GET.get("status", "").strip()

        if search:
            queryset = queryset.filter(
                Q(marketplace_order__marketplace_order_id__icontains=search)
                | Q(product_id__icontains=search)
                | Q(number__icontains=search)
                | Q(ritm_number__icontains=search)
                | Q(tasks__number__icontains=search)
            ).distinct()

        if status:
            queryset = queryset.filter(stage=status)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["sync_statuses"] = (
            Request.objects
            .exclude(stage="")
            .values_list("stage", flat=True)
            .distinct()
            .order_by("stage")
        )

        return context

class OrderDetailView(StaffRequiredMixin, DetailView):
    model = Request
    template_name = "gdx_admin/apps/orders/orders/order_detail.html"
    context_object_name = "request"
    pk_url_kwarg = "request_id"
    slug_field = "request_id"
    slug_url_kwarg = "request_id"

    def get_queryset(self):
        return Request.objects.prefetch_related("tasks")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["task_total"] = Task.objects.filter(request=self.object).count()

        return context


class OrdersAnalyticsView(StaffRequiredMixin, TemplateView):
    template_name = "gdx_admin/apps/orders/analytics/analytics.html"

    VALID_RANGES = {
        "7d": 7,
        "14d": 14,
        "30d": 30,
        "90d": 90,
        "1y": 365,
    }

    CLOSED_STATES = (
        "Closed Complete",
        "Closed Incomplete",
        "Closed Cancelled",
    )

    COMPLETED_TASK_STATES = (
        "Completed",
        "Closed Complete",
    )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        today = timezone.localdate()
        now = timezone.now()

        selected_range = self.request.GET.get("range", "14d")
        start_value = self.request.GET.get("start", "").strip()
        end_value = self.request.GET.get("end", "").strip()
        product_id = self.request.GET.get("product_id", "").strip()

        start_date = None
        end_date = None

        # Custom dates take precedence.
        if selected_range == "custom":
            if start_value:
                try:
                    start_date = datetime.strptime(
                        start_value,
                        "%Y-%m-%d",
                    ).date()
                except ValueError:
                    start_value = ""

            if end_value:
                try:
                    end_date = datetime.strptime(
                        end_value,
                        "%Y-%m-%d",
                    ).date()
                except ValueError:
                    end_value = ""

            # If neither custom date is valid, fall back to 14 days.
            if not start_date and not end_date:
                selected_range = "14d"
                end_date = today
                start_date = today - timedelta(days=13)
                start_value = start_date.isoformat()
                end_value = end_date.isoformat()
        else:
            if selected_range not in self.VALID_RANGES:
                selected_range = "14d"

            number_of_days = self.VALID_RANGES[selected_range]
            end_date = today
            start_date = today - timedelta(days=number_of_days - 1)
            start_value = start_date.isoformat()
            end_value = end_date.isoformat()

        # Normalize a reversed custom range.
        if start_date and end_date and start_date > end_date:
            start_date, end_date = end_date, start_date
            start_value = start_date.isoformat()
            end_value = end_date.isoformat()

        requests = Request.objects.all()
        orders = MarketplaceOrder.objects.all()

        if start_date:
            requests = requests.filter(opened_at__date__gte=start_date)
            orders = orders.filter(
                requests__opened_at__date__gte=start_date
            )

        if end_date:
            requests = requests.filter(opened_at__date__lte=end_date)
            orders = orders.filter(
                requests__opened_at__date__lte=end_date
            )

        if product_id:
            requests = requests.filter(product_id=product_id)
            orders = orders.filter(requests__product_id=product_id)

        requests = requests.distinct()
        orders = orders.distinct()

        # Reuse these task querysets throughout the view.
        tasks = Task.objects.filter(request__in=requests).distinct()
        completed_tasks = tasks.filter(
            state__in=self.COMPLETED_TASK_STATES
        )
        active_tasks = tasks.exclude(
            state__in=self.COMPLETED_TASK_STATES
        )

        # A request is open only when it has no close timestamp and its state is
        # not one of the known closed states.
        open_requests = requests.filter(
            closed_at__isnull=True
        ).exclude(
            ritm_state__in=self.CLOSED_STATES
        )

        # Basic totals.
        total_requests = requests.count()
        total_orders = orders.count()
        total_tasks = tasks.count()

        total_closed = requests.filter(
            Q(closed_at__isnull=False)
            | Q(ritm_state__in=self.CLOSED_STATES)
        ).distinct().count()

        closed_complete = requests.filter(
            ritm_state__iexact="Closed Complete"
        ).count()
        closed_incomplete = requests.filter(
            ritm_state__iexact="Closed Incomplete"
        ).count()

        # Date boundaries.
        start_of_today = timezone.make_aware(
            datetime.combine(today, time.min),
            timezone.get_current_timezone(),
        )
        start_of_tomorrow = start_of_today + timedelta(days=1)
        start_of_month = today.replace(day=1)
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        # Task.due supplies due dates for task and request analytics.
        overdue_tasks = active_tasks.filter(
            due__isnull=False,
            due__lt=now,
        )

        # A request is overdue when it is open and has at least one active,
        # overdue task. distinct() prevents duplicate requests.
        overdue_requests = open_requests.filter(
            tasks__in=overdue_tasks
        ).distinct()

        # Map the earliest linked task due date onto each request. This treats
        # the earliest task deadline as the request-level due date.
        requests_with_due_dates = requests.annotate(
            request_due_at=Min("tasks__due")
        ).filter(
            request_due_at__isnull=False
        )

        # Compare the actual request close time with the mapped task due date.
        sla_eligible = requests_with_due_dates.filter(
            closed_at__isnull=False
        )
        sla_met = sla_eligible.filter(
            closed_at__lte=F("request_due_at")
        ).count()
        sla_breached = sla_eligible.filter(
            closed_at__gt=F("request_due_at")
        ).count()
        total_sla_eligible = sla_met + sla_breached

        # Average request resolution duration.
        avg_resolution = (
            requests.filter(
                closed_at__isnull=False,
                opened_at__isnull=False,
            )
            .annotate(
                resolution_time=ExpressionWrapper(
                    F("closed_at") - F("opened_at"),
                    output_field=DurationField(),
                )
            )
            .aggregate(avg_time=Avg("resolution_time"))
        )
        avg_resolution_time = avg_resolution["avg_time"]

        if avg_resolution_time:
            avg_resolution_hours = round(
                avg_resolution_time.total_seconds() / 3600,
                1,
            )
            avg_resolution_days = round(
                avg_resolution_time.total_seconds() / 86400,
                1,
            )
        else:
            avg_resolution_hours = 0
            avg_resolution_days = 0

        # Chart: order volume by request-opened date.
        volume = list(
            orders.annotate(
                day=TruncDay("requests__opened_at")
            )
            .values("day")
            .annotate(value=Count("pk", distinct=True))
            .exclude(day__isnull=True)
            .order_by("day")
        )

        # Chart: request state distribution.
        states = list(
            requests.values("ritm_state")
            .annotate(value=Count("id"))
            .order_by("-value")
        )

        # Chart: requests opened versus closed.
        opened_volume = list(
            requests.annotate(day=TruncDay("opened_at"))
            .values("day")
            .annotate(value=Count("id"))
            .exclude(day__isnull=True)
            .order_by("day")
        )
        closed_volume = list(
            requests.filter(closed_at__isnull=False)
            .annotate(day=TruncDay("closed_at"))
            .values("day")
            .annotate(value=Count("id"))
            .exclude(day__isnull=True)
            .order_by("day")
        )

        opened_by_day = {
            item["day"].date(): item["value"]
            for item in opened_volume
        }
        closed_by_day = {
            item["day"].date(): item["value"]
            for item in closed_volume
        }
        all_activity_days = sorted(
            set(opened_by_day) | set(closed_by_day)
        )
        activity_chart = [
            {
                "label": day.strftime("%b %d"),
                "opened": opened_by_day.get(day, 0),
                "closed": closed_by_day.get(day, 0),
            }
            for day in all_activity_days
        ]

        # Aging applies to the current open backlog.
        aging_0_7 = open_requests.filter(
            opened_at__gte=last_7_days
        ).count()
        aging_8_30 = open_requests.filter(
            opened_at__lt=last_7_days,
            opened_at__gte=last_30_days,
        ).count()
        aging_30_plus = open_requests.filter(
            opened_at__lt=last_30_days
        ).count()

        # KPI percentages.
        completion_rate = (
            round(closed_complete * 100 / total_requests, 1)
            if total_requests
            else 0
        )
        sla_compliance = (
            round(sla_met * 100 / total_sla_eligible, 1)
            if total_sla_eligible
            else 0
        )

        open_request_count = open_requests.count()
        overdue_request_count = overdue_requests.count()
        overdue_rate = (
            round(overdue_request_count * 100 / open_request_count, 1)
            if open_request_count
            else 0
        )
        task_completion_rate = (
            round(completed_tasks.count() * 100 / total_tasks, 1)
            if total_tasks
            else 0
        )
        avg_tasks_per_request = (
            round(total_tasks / total_requests, 2)
            if total_requests
            else 0
        )

        # Top products.
        top_products = list(
            requests.values("product_id")
            .annotate(total=Count("id"))
            .order_by("-total")[:10]
        )

        # Top assignment groups.
        assignment_groups = list(
            tasks.values("assignment_group")
            .annotate(total=Count("id"))
            .order_by("-total")[:10]
        )

        max_product_total = max(
            (item["total"] for item in top_products),
            default=0,
        )
        max_assignment_group_total = max(
            (item["total"] for item in assignment_groups),
            default=0,
        )

        for item in top_products:
            item["percentage"] = (
                round(item["total"] * 100 / max_product_total, 1)
                if max_product_total
                else 0
            )

        for item in assignment_groups:
            item["percentage"] = (
                round(
                    item["total"] * 100 / max_assignment_group_total,
                    1,
                )
                if max_assignment_group_total
                else 0
            )

        context["stats"] = [
            {
                "label": "Requests",
                "value": total_requests,
                "icon": "bi-inbox",
                "color": "primary",
            },
            {
                "label": "Orders",
                "value": total_orders,
                "icon": "bi-cart",
                "color": "info",
            },
            {
                "label": "Tasks",
                "value": total_tasks,
                "icon": "bi-list-check",
                "color": "secondary",
            },
            {
                "label": "Closed Complete",
                "value": closed_complete,
                "icon": "bi-check-circle",
                "color": "success",
            },
        ]

        context.update({
            "total_requests": total_requests,
            "total_orders": total_orders,
            "total_tasks": total_tasks,
            "total_closed": total_closed,
            "open_requests": open_request_count,
            "closed_complete": closed_complete,
            "closed_incomplete": closed_incomplete,
            "pending_requests": requests.filter(
                ritm_state__iexact="Pending"
            ).count(),
            "in_progress_requests": requests.filter(
                ritm_state__iexact="In Progress"
            ).count(),
            "completed_tasks": completed_tasks.count(),
            "active_tasks": active_tasks.count(),
            "requests_with_tasks": requests.filter(
                tasks__isnull=False
            ).distinct().count(),
            "requests_without_tasks": requests.filter(
                tasks__isnull=True
            ).distinct().count(),
            "avg_tasks_per_request": avg_tasks_per_request,
            "task_completion_rate": task_completion_rate,
            "requests_today": requests.filter(
                opened_at__gte=start_of_today,
                opened_at__lt=start_of_tomorrow,
            ).count(),
            "requests_this_month": requests.filter(
                opened_at__date__gte=start_of_month
            ).count(),
            "requests_last_7_days": requests.filter(
                opened_at__gte=last_7_days
            ).count(),
            "requests_last_30_days": requests.filter(
                opened_at__gte=last_30_days
            ).count(),
            "tasks_created_today": tasks.filter(
                created_at__gte=start_of_today,
                created_at__lt=start_of_tomorrow,
            ).count(),
            # Task has no completed_at field. This proxy counts completed-state
            # tasks whose latest update occurred today.
            "tasks_completed_today": completed_tasks.filter(
                updated_at__gte=start_of_today,
                updated_at__lt=start_of_tomorrow,
            ).count(),
            "overdue_requests": overdue_request_count,
            "overdue_tasks": overdue_tasks.count(),
            "overdue_rate": overdue_rate,
            "aging_0_7": aging_0_7,
            "aging_8_30": aging_8_30,
            "aging_30_plus": aging_30_plus,
            "sla_met": sla_met,
            "sla_breached": sla_breached,
            "sla_eligible": total_sla_eligible,
            "sla_compliance": sla_compliance,
            # Request has no confirmed priority field in the supplied schema.
            # Keep existing template keys without executing invalid lookups.
            "critical_requests": 0,
            "high_requests": 0,
            "medium_requests": 0,
            "low_requests": 0,
            "backlog": open_request_count,
            "backlog_high_priority": 0,
            "closed_last_7_days": requests.filter(
                closed_at__gte=last_7_days
            ).count(),
            "closed_last_30_days": requests.filter(
                closed_at__gte=last_30_days
            ).count(),
            "avg_resolution_time": avg_resolution_time,
            "avg_resolution_hours": avg_resolution_hours,
            "avg_resolution_days": avg_resolution_days,
            "completion_rate": completion_rate,
            "top_products": top_products,
            "assignment_groups": assignment_groups,
            "filters": {
                "range": selected_range,
                "start": start_value,
                "end": end_value,
                "product_id": product_id,
            },
            "volume_chart_json": json.dumps([
                {
                    "label": item["day"].strftime("%b %d"),
                    "value": item["value"],
                }
                for item in volume
            ]),
            "state_chart_json": json.dumps([
                {
                    "label": item["ritm_state"] or "Unknown",
                    "value": item["value"],
                }
                for item in states
            ]),
            "activity_chart_json": json.dumps(activity_chart),
            "aging_chart_json": json.dumps([
                {"label": "0 to 7 days", "value": aging_0_7},
                {"label": "8 to 30 days", "value": aging_8_30},
                {"label": "More than 30 days", "value": aging_30_plus},
            ]),
        })

        return context


class TrackOrderPageView(StaffRequiredMixin, TemplateView):
    template_name='gdx_admin/apps/orders/tracking/track_order.html'
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); identifier=self.request.GET.get('identifier','').strip(); c.update(identifier=identifier,searched=bool(identifier),order=None)
        if identifier:
            qs=MarketplaceOrder.objects.prefetch_related('requests__tasks')
            if identifier.upper().startswith('GDX-ORD-'): qs=qs.filter(marketplace_order_id__iexact=identifier)
            elif identifier.upper().startswith('REQ'): qs=qs.filter(requests__number__iexact=identifier)
            elif identifier.upper().startswith('RITM'): qs=qs.filter(requests__ritm_number__iexact=identifier)
            c['order']=qs.distinct().first()
        return c

class AuditListView(StaffRequiredMixin, ListView):
    model=ServiceNowSyncAudit; template_name='gdx_admin/apps/orders/audit/audit_list.html'; paginate_by=50
    def get_queryset(self):
        qs=super().get_queryset().select_related('marketplace_order'); q=self.request.GET.get('q',''); status=self.request.GET.get('status',''); entity=self.request.GET.get('entity','')
        if q: qs=qs.filter(Q(correlation_id__icontains=q)|Q(sync_run_id__icontains=q)|Q(servicenow_ritm_id__icontains=q)|Q(request_number__icontains=q)|Q(ritm_number__icontains=q)|Q(task_number__icontains=q)|Q(marketplace_order__marketplace_order_id__icontains=q))
        if status: qs=qs.filter(status=status)
        if entity: qs=qs.filter(entity_type=entity)
        return qs
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c['audit_statuses']=ServiceNowSyncAudit.objects.values_list('status',flat=True).distinct(); c['audit_entities']=ServiceNowSyncAudit.objects.values_list('entity_type',flat=True).distinct(); return c

class SyncHealthView(StaffRequiredMixin, TemplateView):
    template_name='gdx_admin/apps/orders/sync_health/sync_health.html'
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c['sync_cursor']=SyncCursor.objects.filter(name='servicenow-orders').first(); c['recent_failures']=ServiceNowSyncAudit.objects.filter(status__in=['FAILED','QUARANTINED'])[:25]; c['reconciliation']={'orders_without_requests':MarketplaceOrder.objects.annotate(n=Count('requests')).filter(n=0).count(),'requests_without_ritm_id':Request.objects.filter(Q(ritm_id='')|Q(ritm_id__isnull=True)).count(),'orphan_tasks':Task.objects.filter(request__isnull=True).count(),'duplicates':0}; c['stats']=[{'label':'Last Sync Status','value':c['sync_cursor'].last_status if c['sync_cursor'] else 'Unknown'},{'label':'Failed Events','value':ServiceNowSyncAudit.objects.filter(status='FAILED').count()},{'label':'Quarantined','value':ServiceNowSyncAudit.objects.filter(status='QUARANTINED').count()},{'label':'Orders Without Requests','value':c['reconciliation']['orders_without_requests']}]; return c







class SyncHealthView(SyncHealthContextMixin, TemplateView):
    template_name = "gdx_admin/apps/orders/sync_health/sync_health.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Keep your existing polling_cursor, recent_failures, and audit context here.
        context.setdefault("recent_failures", [])
        context.setdefault("polling_cursor", None)
        return context
