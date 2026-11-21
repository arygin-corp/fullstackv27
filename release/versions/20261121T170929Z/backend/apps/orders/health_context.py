from __future__ import annotations

import json
from collections import defaultdict
from datetime import timedelta

from django.conf import settings
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import MarketplaceOrder, Request, Task

DEFAULT_ORDER_PROCESSING_SITES = {
    "PLANO": {"label": "Plano", "region": "Texas", "latitude": 33.0198, "longitude": -96.6989},
    "DALLAS": {"label": "Dallas", "region": "Texas", "latitude": 32.7767, "longitude": -96.7970},
    "GEORGETOWN": {"label": "Georgetown", "region": "Texas", "latitude": 30.6333, "longitude": -97.6770},
    "KENTUCKY": {"label": "Kentucky", "region": "Kentucky", "latitude": 38.2004, "longitude": -84.8776},
}


def _has_field(model, name):
    return any(field.name == name for field in model._meta.get_fields())


def _json(value):
    return json.dumps(value, default=str)


def _state_failure_query(model):
    names = {field.name for field in model._meta.get_fields()}
    candidates = [name for name in ("state", "stage", "status") if name in names]
    query = Q(pk__in=[])
    for name in candidates:
        query |= Q(**{f"{name}__icontains": "fail"})
        query |= Q(**{f"{name}__icontains": "error"})
    return query


def build_processing_locations():
    """Aggregate Task assignment groups into configured processing sites.

    Override ORDER_PROCESSING_SITES in Django settings for real organization sites.
    Unmatched groups remain visible in the fallback region/site counts.
    """
    site_config = getattr(settings, "ORDER_PROCESSING_SITES", DEFAULT_ORDER_PROCESSING_SITES)
    rows = Task.objects.exclude(assignment_group__isnull=True).exclude(assignment_group="").values("assignment_group").annotate(task_count=Count("pk")).order_by("-task_count")
    matched = defaultdict(lambda: {"task_count": 0, "groups": set()})
    unmatched = []
    for row in rows:
        group = (row["assignment_group"] or "").strip()
        upper = group.upper()
        site_key = next((key for key in site_config if key.upper() in upper), None)
        if site_key:
            matched[site_key]["task_count"] += row["task_count"]
            matched[site_key]["groups"].add(group)
        else:
            unmatched.append({"site": group, "region": "Unmapped", "task_count": row["task_count"]})

    locations=[]
    for key, totals in matched.items():
        config=site_config[key]
        locations.append({
            "site": config.get("label", key.title()),
            "region": config.get("region", "Unmapped"),
            "latitude": config.get("latitude"),
            "longitude": config.get("longitude"),
            "task_count": totals["task_count"],
            "assignment_groups": sorted(totals["groups"]),
            "mapped": config.get("latitude") is not None and config.get("longitude") is not None,
        })
    locations.sort(key=lambda item: item["task_count"], reverse=True)

    region_counts=defaultdict(int)
    for item in locations:
        region_counts[item["region"]] += item["task_count"]
    for item in unmatched:
        region_counts[item["region"]] += item["task_count"]

    regions=[{"region": region, "task_count": count} for region,count in sorted(region_counts.items(), key=lambda x:x[1], reverse=True)]
    return locations, regions, unmatched[:10]


def build_sync_health_context(days=14):
    today=timezone.localdate()
    start=today-timedelta(days=days-1)
    request_date_field="opened_at" if _has_field(Request,"opened_at") else None
    task_date_field="updated_at" if _has_field(Task,"updated_at") else None

    throughput=[]
    if request_date_field:
        rows=(Request.objects.filter(**{f"{request_date_field}__date__gte":start})
              .annotate(day=TruncDate(request_date_field)).values("day")
              .annotate(value=Count("pk")).order_by("day"))
        throughput=[{"label":row["day"].strftime("%b %d"),"value":row["value"]} for row in rows if row["day"]]

    task_failure_query=_state_failure_query(Task)
    failures=[]
    if task_date_field:
        rows=(Task.objects.filter(task_failure_query, **{f"{task_date_field}__date__gte":start})
              .annotate(day=TruncDate(task_date_field)).values("day")
              .annotate(value=Count("pk")).order_by("day"))
        failures=[{"label":row["day"].strftime("%b %d"),"value":row["value"]} for row in rows if row["day"]]

    total_tasks=Task.objects.count()
    failed_tasks=Task.objects.filter(task_failure_query).count()
    healthy_tasks=max(total_tasks-failed_tasks,0)
    health_score=round((healthy_tasks/total_tasks)*100,1) if total_tasks else 100.0
    pulse=[health_score, max(health_score-.4,0), health_score, min(health_score+.2,100), max(health_score-.2,0), health_score, min(health_score+.1,100)]
    locations,regions,unmatched=build_processing_locations()

    orders_without_requests=MarketplaceOrder.objects.annotate(request_total=Count("requests")).filter(request_total=0).count()
    ritm_field="ritm_number" if _has_field(Request,"ritm_number") else None
    requests_without_ritm=Request.objects.filter(Q(**{f"{ritm_field}__isnull":True})|Q(**{ritm_field:""})).count() if ritm_field else 0

    context={
        "health_metrics": {
            "orders": MarketplaceOrder.objects.count(),
            "requests": Request.objects.count(),
            "tasks": total_tasks,
            "failed_tasks": failed_tasks,
            "health_score": health_score,
        },
        "reconciliation": {
            "orders_without_requests": orders_without_requests,
            "requests_without_ritm_id": requests_without_ritm,
            "orphan_tasks": 0,
        },
        "processing_locations": locations,
        "processing_regions": regions,
        "unmapped_processing_groups": unmatched,
        "throughput_chart_json": _json(throughput),
        "failure_chart_json": _json(failures),
        "pulse_chart_json": _json(pulse),
        "processing_locations_json": _json(locations),
        "processing_regions_json": _json(regions),
        "google_maps_api_key": getattr(settings,"GOOGLE_MAPS_API_KEY",""),
    }
    return context


class SyncHealthContextMixin:
    health_window_days=14
    def get_context_data(self, **kwargs):
        context=super().get_context_data(**kwargs)
        context.update(build_sync_health_context(self.health_window_days))
        return context
