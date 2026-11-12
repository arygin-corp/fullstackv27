from datetime import timedelta
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from ..models import FormChangeLog
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

PAGE_SIZE = 25
AUDIT_PAGE_SIZE = 25

def _page(request, queryset, per_page=PAGE_SIZE):
    return Paginator(queryset, per_page).get_page(request.GET.get('page'))

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def audit_dashboard(request):
    queryset = FormChangeLog.objects.select_related('actor')
    since = timezone.now() - timedelta(days=7)
    return render(request, 'gdx_admin/pages/dar/dashboard/dashboard.html', {'stats': [{'label': 'All changes', 'value': queryset.count()}, {'label': 'Last 7 days', 'value': queryset.filter(created_at__gte=since).count()}, {'label': 'Creates', 'value': queryset.filter(action='create').count()}, {'label': 'Deletes', 'value': queryset.filter(action='delete').count()}], 'recent_changes': queryset.order_by('-created_at')[:20], 'breadcrumbs': _breadcrumbs(('DAR', None), ('Audit', None))})

def audit_log(request):
    queryset = FormChangeLog.objects.select_related('actor').order_by('-created_at')
    query = request.GET.get('q', '').strip()
    action = request.GET.get('status', '').strip()
    if query:
        queryset = queryset.filter(Q(object_model__icontains=query) | Q(object_pk__icontains=query) | Q(actor_label__icontains=query) | Q(request_id__icontains=query))
    if action:
        queryset = queryset.filter(action=action)
    page = _page(request, queryset, AUDIT_PAGE_SIZE)
    return render(request, 'gdx_admin/pages/dar/audit/audit_log.html', {'events': page.object_list, 'page_obj': page, 'status_choices': (('create', 'Create'), ('update', 'Update'), ('delete', 'Delete')), 'breadcrumbs': _breadcrumbs(('DAR', None), ('Audit', '../'), ('Log', None))})

def audit_detail(request, pk):
    event = get_object_or_404(FormChangeLog.objects.select_related('actor'), pk=pk)
    return render(request, 'gdx_admin/pages/dar/audit/change_detail.html', {'event': event, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Audit', '../'), (str(event.pk), None))})
