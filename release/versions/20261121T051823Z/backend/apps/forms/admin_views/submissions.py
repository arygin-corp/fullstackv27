from django.core.paginator import Paginator
from django.db.models import Q
from ..models import FormSubmission, SubmissionStatus
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

PAGE_SIZE = 25
AUDIT_PAGE_SIZE = 25

def _page(request, queryset, per_page=PAGE_SIZE):
    return Paginator(queryset, per_page).get_page(request.GET.get('page'))

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def _status_choices():
    return SubmissionStatus.choices

def submission_list(request):
    queryset = FormSubmission.objects.select_related('form', 'submitted_by').prefetch_related('values__field').order_by('-created_at')
    query = request.GET.get('q', '').strip()
    status = request.GET.get('status', '').strip()
    if query:
        queryset = queryset.filter(Q(request_number__icontains=query) | Q(form__name__icontains=query) | Q(submitted_by__username__icontains=query))
    if status:
        queryset = queryset.filter(status=status)
    page = _page(request, queryset)
    return render(request, 'gdx_admin/pages/dar/submissions/submission_history.html', {'submissions': page.object_list, 'page_obj': page, 'status_choices': _status_choices(), 'breadcrumbs': _breadcrumbs(('DAR', None), ('Submissions', None))})

def submission_detail(request, pk):
    submission = get_object_or_404(FormSubmission.objects.select_related('form', 'submitted_by').prefetch_related('values__field'), pk=pk)
    return render(request, 'gdx_admin/pages/dar/submissions/submission_detail.html', {'submission': submission, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Submissions', '../'), (submission.request_number or str(submission.pk), None))})
