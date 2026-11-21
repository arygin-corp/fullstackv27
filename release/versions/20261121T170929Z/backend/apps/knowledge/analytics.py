from collections import Counter
from datetime import date, datetime, timedelta
from django.conf import settings
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from .models import AccessRequest, GovernanceAssessment, MarketplaceActivity, MarketplaceAnalyticsSnapshot, MarketplaceDailyMetric, MarketplaceFavorite, MarketplaceProduct, MarketplaceSearchEvent

ACTIVITY_METRICS = {
    MarketplaceActivity.Kind.VIEW: "product_views",
    MarketplaceActivity.Kind.RECOMMEND: "recommendations",
    MarketplaceActivity.Kind.FAVORITE: "favorites",
    MarketplaceActivity.Kind.CART: "cart_additions",
    MarketplaceActivity.Kind.ACCESS_CHECK: "access_checks",
    MarketplaceActivity.Kind.GOVERNANCE_CHECK: "governance_checks",
    MarketplaceActivity.Kind.VIKKI: "vikki_interactions",
}

def normalize_query(value):
    return " ".join(str(value or "").casefold().split())

def clamp_days(value):
    try: days=int(value)
    except (TypeError,ValueError): days=settings.MARKETPLACE_ANALYTICS_DEFAULT_DAYS
    return max(1,min(days,settings.MARKETPLACE_ANALYTICS_MAX_DAYS))

def period(days=None):
    days=clamp_days(days); end=timezone.localdate(); start=end-timedelta(days=days-1)
    return start,end

def log_search(user, query, result_count, recommendation=False, filters=None):
    normalized=normalize_query(query)
    if not normalized: return None
    return MarketplaceSearchEvent.objects.create(user=user,query=query,normalized_query=normalized,result_count=max(int(result_count),0),recommendation=recommendation,filters=filters or {})

def _activity_range(user,start,end):
    return MarketplaceActivity.objects.filter(user=user,created_at__date__range=(start,end))

def _search_range(user,start,end):
    return MarketplaceSearchEvent.objects.filter(user=user,created_at__date__range=(start,end))

def search_gaps(user,start,end,minimum=None,limit=25):
    minimum=minimum or settings.MARKETPLACE_ANALYTICS_SEARCH_GAP_MIN_COUNT
    rows=(_search_range(user,start,end).filter(result_count=0).values("normalized_query").annotate(search_count=Count("id")).filter(search_count__gte=minimum).order_by("-search_count","normalized_query")[:limit])
    return [{"query":x["normalized_query"],"search_count":x["search_count"]} for x in rows]

def dashboard(user,days=None,persist=False):
    start,end=period(days); activities=_activity_range(user,start,end); searches=_search_range(user,start,end)
    activity_counts={x["kind"]:x["count"] for x in activities.values("kind").annotate(count=Count("id"))}
    total_searches=searches.count(); successful_searches=searches.filter(result_count__gt=0).count(); zero_result_searches=total_searches-successful_searches
    unique_queries=searches.values("normalized_query").distinct().count()
    product_count=MarketplaceProduct.objects.filter(owner=user,active=True).count()
    favorite_count=MarketplaceFavorite.objects.filter(user=user).count()
    access_requests=AccessRequest.objects.filter(owner=user,created_at__date__range=(start,end))
    access_by_status={x["status"]:x["count"] for x in access_requests.values("status").annotate(count=Count("id"))}
    governance=GovernanceAssessment.objects.filter(owner=user,created_at__date__range=(start,end))
    governance_by_status={x["status"]:x["count"] for x in governance.values("status").annotate(count=Count("id"))}
    top_products=[]
    for row in activities.filter(product__isnull=False).values("product_id","product__name","product__domain__name","product__fulfillment_team__name").annotate(activity_count=Count("id")).order_by("-activity_count")[:10]:
        top_products.append({"product_id":row["product_id"],"product_name":row["product__name"],"domain":row["product__domain__name"],"fulfillment_team":row["product__fulfillment_team__name"],"activity_count":row["activity_count"]})
    domain_activity=[]
    for row in activities.filter(product__domain__isnull=False).values("product__domain__name").annotate(activity_count=Count("id")).order_by("-activity_count")[:20]:
        domain_activity.append({"domain":row["product__domain__name"],"activity_count":row["activity_count"]})
    fulfillment=[]
    for row in activities.filter(product__fulfillment_team__isnull=False).values("product__fulfillment_team__name").annotate(activity_count=Count("id")).order_by("-activity_count")[:20]:
        fulfillment.append({"team":row["product__fulfillment_team__name"],"activity_count":row["activity_count"]})
    popular_queries=[{"query":x["normalized_query"],"search_count":x["search_count"]} for x in searches.values("normalized_query").annotate(search_count=Count("id")).order_by("-search_count")[:20]]
    daily={}
    for row in activities.annotate(day=TruncDate("created_at")).values("day","kind").annotate(count=Count("id")).order_by("day"):
        key=row["day"].isoformat(); daily.setdefault(key,{"date":key}); daily[key][ACTIVITY_METRICS.get(row["kind"],row["kind"])]=row["count"]
    for row in searches.annotate(day=TruncDate("created_at")).values("day").annotate(count=Count("id")).order_by("day"):
        key=row["day"].isoformat(); daily.setdefault(key,{"date":key}); daily[key]["searches"]=row["count"]
    payload={
        "period":{"start":start.isoformat(),"end":end.isoformat()},
        "kpis":{"active_products":product_count,"searches":total_searches,"successful_searches":successful_searches,"zero_result_searches":zero_result_searches,"search_success_rate":round(successful_searches/total_searches,4) if total_searches else None,"unique_queries":unique_queries,"favorites":favorite_count,"vikki_interactions":activity_counts.get(MarketplaceActivity.Kind.VIKKI,0),"product_views":activity_counts.get(MarketplaceActivity.Kind.VIEW,0),"recommendations":activity_counts.get(MarketplaceActivity.Kind.RECOMMEND,0),"cart_additions":activity_counts.get(MarketplaceActivity.Kind.CART,0),"access_checks":activity_counts.get(MarketplaceActivity.Kind.ACCESS_CHECK,0)},
        "access_requests_by_status":access_by_status,
        "governance_assessments_by_status":governance_by_status,
        "top_products":top_products,
        "domain_activity":domain_activity,
        "fulfillment_activity":fulfillment,
        "popular_queries":popular_queries,
        "search_gaps":search_gaps(user,start,end),
        "daily_trend":list(daily.values()),
    }
    if persist: MarketplaceAnalyticsSnapshot.objects.create(owner=user,period_start=start,period_end=end,payload=payload)
    return payload

def rebuild_daily_metrics(user,start=None,end=None):
    start=start or (timezone.localdate()-timedelta(days=settings.MARKETPLACE_ANALYTICS_DEFAULT_DAYS-1)); end=end or timezone.localdate()
    MarketplaceDailyMetric.objects.filter(owner=user,metric_date__range=(start,end)).delete(); rows=[]
    activities=_activity_range(user,start,end)
    for item in activities.annotate(day=TruncDate("created_at")).values("day","kind").annotate(value=Count("id")):
        rows.append(MarketplaceDailyMetric(owner=user,metric_date=item["day"],metric_name=ACTIVITY_METRICS.get(item["kind"],item["kind"]),value=item["value"]))
    for item in _search_range(user,start,end).annotate(day=TruncDate("created_at")).values("day").annotate(value=Count("id")):
        rows.append(MarketplaceDailyMetric(owner=user,metric_date=item["day"],metric_name="searches",value=item["value"]))
    MarketplaceDailyMetric.objects.bulk_create(rows)
    return len(rows)
