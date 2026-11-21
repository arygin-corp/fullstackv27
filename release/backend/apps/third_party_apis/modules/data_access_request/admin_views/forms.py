from django.core.paginator import Paginator
from django.db.models import Count, Q
from ..models import FormDefinition
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

PAGE_SIZE = 25
AUDIT_PAGE_SIZE = 25

def _page(request, queryset, per_page=PAGE_SIZE):
    return Paginator(queryset, per_page).get_page(request.GET.get('page'))

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def form_list(request):
    queryset = FormDefinition.objects.annotate(field_count=Count('fields', distinct=True), rule_count=Count('rule_groups', distinct=True)).order_by('name', 'version')
    if request.GET.get('q'):
        queryset = queryset.filter(Q(name__icontains=request.GET['q']) | Q(slug__icontains=request.GET['q']))
    page = _page(request, queryset)
    return render(request, 'gdx_admin/pages/dar/forms/form_list.html', {'forms': page.object_list, 'page_obj': page, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Forms', None))})

def form_detail(request, pk):
    form = get_object_or_404(FormDefinition.objects.prefetch_related('sections__fields__options', 'sections__fields__validation_rules', 'rule_groups__rules', 'rule_groups__actions', 'routing_rules'), pk=pk)
    return render(request, 'gdx_admin/pages/dar/forms/form_detail.html', {'form': form, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Forms', '../'), (form.name, None))})

def form_preview(request, pk):
    form = get_object_or_404(FormDefinition.objects.prefetch_related('sections__fields__options', 'fields__options'), pk=pk)
    return render(request, 'gdx_admin/pages/dar/forms/form_preview.html', {'form': form, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Forms', '../../'), (form.name, '../'), ('Preview', None))})
