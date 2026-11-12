import csv
from collections import Counter, defaultdict
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from ..models import FormDefinition, FormSubmission, RoutingRule, SubmissionStatus, ValidationRule
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def analytics_export(request):
    queryset = FormSubmission.objects.select_related('form', 'submitted_by').order_by('-created_at')
    start = request.GET.get('start')
    end = request.GET.get('end')
    if start:
        queryset = queryset.filter(created_at__date__gte=start)
    if end:
        queryset = queryset.filter(created_at__date__lte=end)
    if request.GET.get('format') == 'json':
        data = [{'id': row.pk, 'request_number': row.request_number, 'created_at': row.created_at.isoformat(), 'status': row.status, 'form': row.form.slug, 'form_version': row.form_version, 'submitted_by': str(row.submitted_by or '')} for row in queryset.iterator()]
        response = JsonResponse(data, safe=False)
        response['Content-Disposition'] = 'attachment; filename="dar-submissions.json"'
        return response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="dar-submissions.csv"'
    writer = csv.writer(response)
    writer.writerow(['id', 'request_number', 'created_at', 'status', 'form', 'form_version', 'submitted_by'])
    for row in queryset.iterator():
        writer.writerow([row.pk, row.request_number, row.created_at.isoformat(), row.status, row.form.slug, row.form_version, row.submitted_by])
    return response

def analytics_export_page(request):
    return render(request, 'gdx_admin/pages/dar/analytics/export.html', {'breadcrumbs': _breadcrumbs(('DAR', None), ('Analytics', '../'), ('Export', None))})

def _first_value(mapping, *paths, default=''):
    """Return the first non-empty value found in nested dictionaries."""
    for path in paths:
        current = mapping
        for key in path:
            if not isinstance(current, dict):
                current = None
                break
            current = current.get(key)
        if current not in (None, '', [], {}):
            return current
    return default

def _text(value, default='Unknown'):
    if value in (None, ''):
        return default
    return str(value).strip() or default

def _float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def analytics_dashboard(request):
    try:
        days = min(max(int(request.GET.get('days', 30)), 1), 365)
    except (TypeError, ValueError):
        days = 30
    now = timezone.now()
    start = now - timedelta(days=days)
    submissions = FormSubmission.objects.filter(created_at__gte=start).select_related('form', 'submitted_by').order_by('created_at')
    status_counts = list(submissions.values('status').annotate(total=Count('id')).order_by('status'))
    submissions_by_day = list(submissions.annotate(day=TruncDate('created_at')).values('day').annotate(total=Count('id')).order_by('day'))
    top_forms = list(submissions.values('form__name', 'form__slug').annotate(total=Count('id')).order_by('-total', 'form__name')[:10])
    top_requestors = list(submissions.exclude(submitted_by__isnull=True).values('submitted_by__username').annotate(total=Count('id')).order_by('-total', 'submitted_by__username')[:10])
    dimensions = {'route': Counter(), 'platform': Counter(), 'domain': Counter(), 'environment': Counter(), 'organization': Counter(), 'fulfillment_group': Counter(), 'control_group': Counter(), 'location': Counter()}
    location_points = defaultdict(lambda: {'count': 0, 'latitude': None, 'longitude': None})
    context_rows = submissions.values_list('context', flat=True).iterator(chunk_size=1000)
    for raw_context in context_rows:
        submission_context = raw_context if isinstance(raw_context, dict) else {}
        routing = submission_context.get('routing')
        if not isinstance(routing, dict):
            routing = {}
        route = _text(_first_value(submission_context, ('routing', 'route_identifier'), ('routing', 'route'), ('route_identifier',)))
        platform = _text(_first_value(submission_context, ('routing', 'platform'), ('platform',), ('v_dar_platform',)))
        domain = _text(_first_value(submission_context, ('routing', 'domain'), ('domain',), ('v_dar_dataDomainSelect',)))
        environment = _text(_first_value(submission_context, ('routing', 'environment'), ('environment',), ('v_dar_environment',)))
        organization = _text(_first_value(submission_context, ('routing', 'organization'), ('organization',), ('v_dar_organization',)))
        fulfillment = _text(_first_value(submission_context, ('routing', 'fulfillment_group'), ('fulfillment_group',), ('v_custom_fulfillment_group_1',)))
        control = _text(_first_value(submission_context, ('routing', 'control_group'), ('control_group',), ('v_custom_control_group',)))
        location = _text(_first_value(submission_context, ('location',), ('site',), ('office_location',), ('requestor', 'location'), ('profile', 'location')))
        dimensions['route'][route] += 1
        dimensions['platform'][platform] += 1
        dimensions['domain'][domain] += 1
        dimensions['environment'][environment] += 1
        dimensions['organization'][organization] += 1
        dimensions['fulfillment_group'][fulfillment] += 1
        dimensions['control_group'][control] += 1
        dimensions['location'][location] += 1
        latitude = _float(_first_value(submission_context, ('latitude',), ('location_data', 'latitude'), ('geo', 'latitude'), ('geo', 'lat'), default=None))
        longitude = _float(_first_value(submission_context, ('longitude',), ('location_data', 'longitude'), ('geo', 'longitude'), ('geo', 'lng'), ('geo', 'lon'), default=None))
        point = location_points[location]
        point['count'] += 1
        if latitude is not None and longitude is not None:
            point['latitude'] = latitude
            point['longitude'] = longitude

    def rows(counter, limit=10):
        return [{'label': label, 'total': total} for label, total in counter.most_common(limit)]
    map_points = [{'location': location, 'count': values['count'], 'latitude': values['latitude'], 'longitude': values['longitude']} for location, values in location_points.items() if values['latitude'] is not None and values['longitude'] is not None]
    total_requests = submissions.count()
    completed = next((row['total'] for row in status_counts if row['status'] == SubmissionStatus.COMPLETED), 0)
    rejected = next((row['total'] for row in status_counts if row['status'] == SubmissionStatus.REJECTED), 0)
    open_requests = submissions.exclude(status__in=[SubmissionStatus.COMPLETED, SubmissionStatus.REJECTED, SubmissionStatus.CANCELLED]).count()
    context = {'days': days, 'analytics_cards': [{'label': 'Requests', 'value': total_requests, 'icon': 'ti ti-file-text'}, {'label': 'Open', 'value': open_requests, 'icon': 'ti ti-clock'}, {'label': 'Completed', 'value': completed, 'icon': 'ti ti-check'}, {'label': 'Rejected', 'value': rejected, 'icon': 'ti ti-x'}, {'label': 'Published Forms', 'value': FormDefinition.objects.filter(is_active=True, is_published=True).count(), 'icon': 'ti ti-layout-list'}, {'label': 'Active Routing Rules', 'value': RoutingRule.objects.filter(is_active=True).count(), 'icon': 'ti ti-route'}, {'label': 'Active Validation Rules', 'value': ValidationRule.objects.filter(is_active=True).count(), 'icon': 'ti ti-shield-check'}, {'label': 'Unique Requestors', 'value': submissions.exclude(submitted_by__isnull=True).values('submitted_by_id').distinct().count(), 'icon': 'ti ti-users'}], 'status_counts': status_counts, 'submissions_by_day': submissions_by_day, 'top_forms': top_forms, 'top_requestors': top_requestors, 'route_distribution': rows(dimensions['route']), 'platform_distribution': rows(dimensions['platform']), 'domain_distribution': rows(dimensions['domain']), 'environment_distribution': rows(dimensions['environment']), 'organization_distribution': rows(dimensions['organization']), 'fulfillment_distribution': rows(dimensions['fulfillment_group']), 'control_distribution': rows(dimensions['control_group']), 'location_distribution': rows(dimensions['location'], limit=25), 'map_points': map_points, 'has_map_points': bool(map_points), 'breadcrumbs': [{'label': 'DAR', 'url': None}, {'label': 'Analytics', 'url': None}]}
    return render(request, 'gdx_admin/pages/dar/analytics/dashboard.html', context)
