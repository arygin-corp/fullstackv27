from datetime import timedelta
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django.db.models.functions import Now, TruncDate
from django.utils import timezone
from ..models import FormChangeLog, FormDefinition, FormSubmission, RoutingRule, RuleGroup, SubmissionStatus, ValidationRule
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

def dashboard(request):
    now = timezone.now()
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)
    last_90_days = now - timedelta(days=90)
    submissions = FormSubmission.objects.select_related('form', 'submitted_by')
    status_counts = {row['status']: row['total'] for row in submissions.values('status').annotate(total=Count('id'))}
    open_requests = submissions.exclude(status__in=[SubmissionStatus.COMPLETED, SubmissionStatus.REJECTED, SubmissionStatus.CANCELLED])
    open_count = open_requests.count()
    SLA_SUBMITTED_DAYS = 2
    SLA_PROCESSING_DAYS = 5
    submitted_sla_breach = open_requests.filter(status=SubmissionStatus.SUBMITTED, created_at__lte=now - timedelta(days=SLA_SUBMITTED_DAYS)).count()
    processing_sla_breach = open_requests.filter(status=SubmissionStatus.PROCESSING, created_at__lte=now - timedelta(days=SLA_PROCESSING_DAYS)).count()
    sla_breached = submitted_sla_breach + processing_sla_breach
    sla_compliance = round((open_count - sla_breached) / open_count * 100, 2) if open_count else 100
    aging_queryset = open_requests.annotate(age_duration=ExpressionWrapper(Now() - F('created_at'), output_field=DurationField()))
    average_age = aging_queryset.aggregate(avg_age=Avg('age_duration'))['avg_age']
    oldest_request = open_requests.order_by('created_at').first()
    aging_buckets = {'0-1 Days': open_requests.filter(created_at__gte=now - timedelta(days=1)).count(), '2-5 Days': open_requests.filter(created_at__lt=now - timedelta(days=1), created_at__gte=now - timedelta(days=5)).count(), '6-10 Days': open_requests.filter(created_at__lt=now - timedelta(days=5), created_at__gte=now - timedelta(days=10)).count(), '11-30 Days': open_requests.filter(created_at__lt=now - timedelta(days=10), created_at__gte=now - timedelta(days=30)).count(), '30+ Days': open_requests.filter(created_at__lt=now - timedelta(days=30)).count()}
    top_aging_requests = open_requests.select_related('form', 'submitted_by').order_by('created_at')[:25]
    requests_near_breach = open_requests.filter(status=SubmissionStatus.SUBMITTED, created_at__lte=now - timedelta(days=1)).order_by('created_at')[:25]
    stats = [{'label': 'Total Requests', 'value': submissions.count(), 'icon': 'ti-file-text', 'color': 'primary'}, {'label': 'Open Requests', 'value': open_count, 'icon': 'ti-loader', 'color': 'warning'}, {'label': 'Completed', 'value': status_counts.get(SubmissionStatus.COMPLETED, 0), 'icon': 'ti-check', 'color': 'success'}, {'label': 'Rejected', 'value': status_counts.get(SubmissionStatus.REJECTED, 0), 'icon': 'ti-x', 'color': 'danger'}, {'label': 'SLA Compliance', 'value': f'{sla_compliance}%', 'icon': 'ti-shield-check', 'color': 'success'}, {'label': 'SLA Breaches', 'value': sla_breached, 'icon': 'ti-alert-triangle', 'color': 'danger'}, {'label': 'Published Forms', 'value': FormDefinition.objects.filter(is_active=True, is_published=True).count(), 'icon': 'ti-layout-list', 'color': 'info'}, {'label': 'Routing Rules', 'value': RoutingRule.objects.filter(is_active=True).count(), 'icon': 'ti-route', 'color': 'secondary'}, {'label': 'Rule Groups', 'value': RuleGroup.objects.count(), 'icon': 'ti-git-merge', 'color': 'secondary'}, {'label': 'Validation Rules', 'value': ValidationRule.objects.filter(is_active=True).count(), 'icon': 'ti-shield', 'color': 'success'}]
    status_chart = list(submissions.values('status').annotate(total=Count('id')).order_by('status'))
    submissions_by_day = list(submissions.filter(created_at__gte=last_30_days).annotate(day=TruncDate('created_at')).values('day').annotate(total=Count('id')).order_by('day'))
    top_forms = FormDefinition.objects.annotate(submission_count=Count('submissions')).order_by('-submission_count', 'name')[:10]
    recent_submissions = submissions.order_by('-created_at')[:25]
    recent_changes = FormChangeLog.objects.select_related('actor').order_by('-created_at')[:20]
    audit_stats = {'creates': FormChangeLog.objects.filter(action='create', created_at__gte=last_7_days).count(), 'updates': FormChangeLog.objects.filter(action='update', created_at__gte=last_7_days).count(), 'deletes': FormChangeLog.objects.filter(action='delete', created_at__gte=last_7_days).count()}
    unpublished_forms = FormDefinition.objects.filter(is_active=True, is_published=False).count()
    forms_without_fields = FormDefinition.objects.annotate(field_count=Count('fields')).filter(field_count=0).count()
    health_checks = [{'label': 'Database', 'status': 'Healthy', 'level': 'success'}, {'label': 'Unpublished Forms', 'status': unpublished_forms, 'level': 'warning' if unpublished_forms else 'success'}, {'label': 'Forms Without Fields', 'status': forms_without_fields, 'level': 'warning' if forms_without_fields else 'success'}]
    context = {'stats': stats, 'status_chart': status_chart, 'submissions_by_day': submissions_by_day, 'aging_buckets': aging_buckets, 'audit_stats': audit_stats, 'health_checks': health_checks, 'top_forms': top_forms, 'recent_submissions': recent_submissions, 'recent_changes': recent_changes, 'top_aging_requests': top_aging_requests, 'requests_near_breach': requests_near_breach, 'sla_breached': sla_breached, 'sla_compliance': sla_compliance, 'average_age': average_age, 'oldest_request': oldest_request}
    return render(request, 'gdx_admin/apps/dar/dashboard/dashboard.html', context)
