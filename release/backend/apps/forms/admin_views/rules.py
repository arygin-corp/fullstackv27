from django.shortcuts import render
from django.shortcuts import get_object_or_404, render
from ..models import RuleGroup



def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]


def rule_groups(request):
    queryset = (
        RuleGroup.objects.select_related('form')
        .prefetch_related(
            'rules__source_field',
            'rules__target_field',
            'actions__target_field',
        )
        .order_by('form__name', 'priority', 'id')
    )
    return render(
        request,
        'gdx_admin/apps/dar/rules/rule_groups.html',
        {
            'rule_groups': queryset,
            'breadcrumbs': _breadcrumbs(('DAR', None), ('Rules', None)),
        },
    )


def rule_detail(request, pk):
    rule = get_object_or_404(
        RuleGroup.objects.prefetch_related(
            "rules",
            "actions",
        ),
        pk=pk,
    )

    return render(
        request,
        "gdx_admin/apps/dar/rules/rule_detail.html",
        {
            "rule": rule,
            "breadcrumbs": _breadcrumbs(
                ("DAR", None),
                ("Rules", "../"),
                (rule.name, None),
            ),
        },
    )