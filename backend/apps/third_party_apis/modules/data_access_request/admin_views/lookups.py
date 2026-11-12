from django.core.paginator import Paginator
from ..models import CompanyHoliday, ProjectAreaCode
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

PAGE_SIZE = 25
AUDIT_PAGE_SIZE = 25

def _page(request, queryset, per_page=PAGE_SIZE):
    return Paginator(queryset, per_page).get_page(request.GET.get('page'))

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def project_codes(request):
    page = _page(request, ProjectAreaCode.objects.order_by('name'))
    return render(request, 'gdx_admin/pages/dar/lookups/project_codes.html', {'project_codes': page.object_list, 'page_obj': page, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Lookups', None), ('Project Codes', None))})

def company_holidays(request):
    return render(request, 'gdx_admin/pages/dar/lookups/company_holidays.html', {'holidays': CompanyHoliday.objects.order_by('month', 'day', 'name'), 'breadcrumbs': _breadcrumbs(('DAR', None), ('Lookups', None), ('Company Holidays', None))})
