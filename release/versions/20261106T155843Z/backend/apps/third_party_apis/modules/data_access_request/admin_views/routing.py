from ..admin_forms import JsonPayloadForm
from ..models import RoutingRule
from ..services.rules import RoutingEngine, RuleConfigurationError
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404, render

def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]

def routing_rules(request):
    queryset = RoutingRule.objects.select_related('form').order_by('form__name', '-priority', 'id')
    return render(request, 'gdx_admin/apps/dar/routing/routing_rules.html', {'routing_rules': queryset, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Routing', None))})

def routing_detail(request, pk):
    rule = get_object_or_404(RoutingRule.objects.select_related('form'), pk=pk)
    return render(request, 'gdx_admin/apps/dar/routing/routing_rule_detail.html', {'rule': rule, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Routing', '../'), (rule.name, None))})

def routing_simulator(request):
    form = JsonPayloadForm(request.POST or None)
    result = None
    if request.method == 'POST' and form.is_valid():
        try:
            result = RoutingEngine.resolve(form.cleaned_data['form'], form.cleaned_data['payload'])
        except RuleConfigurationError as exc:
            form.add_error(None, str(exc))
    return render(request, 'gdx_admin/apps/dar/routing/routing_simulator.html', {'form': form, 'result': result, 'breadcrumbs': _breadcrumbs(('DAR', None), ('Routing', '../'), ('Simulator', None))})


class RoutingListView:
    pass