from django.shortcuts import render

from ..admin_forms import JsonPayloadForm
from ..models import ValidationRule
from ..services.rules import ValidationEngine


def _breadcrumbs(*items):
    return [{'label': label, 'url': url} for label, url in items]


def validation_rules(request):
    queryset = (
        ValidationRule.objects.select_related('field', 'field__form')
        .order_by('field__form__name', 'field__order', 'order')
    )
    return render(
        request,
        'gdx_admin/pages/dar/validation/validation_rules.html',
        {
            'validation_rules': queryset,
            'breadcrumbs': _breadcrumbs(('DAR', None), ('Validation', None)),
        },
    )


def validation_simulator(request):
    payload_form = JsonPayloadForm(request.POST or None)
    errors = None
    tested = False
    states = None

    if request.method == 'POST' and payload_form.is_valid():
        tested = True
        definition = payload_form.cleaned_data['form']
        values_by_key = payload_form.cleaned_data['payload']
        fields = list(
            definition.fields.filter(is_active=True)
            .prefetch_related('options', 'validation_rules')
        )
        values_by_id = {
            field.pk: values_by_key.get(field.key, field.default_value)
            for field in fields
        }
        errors, states = ValidationEngine.validate(definition, values_by_id)

    return render(
        request,
        'gdx_admin/pages/dar/validation/validation_simulator.html',
        {
            'form': payload_form,
            'errors': errors,
            'states': states,
            'tested': tested,
            'breadcrumbs': _breadcrumbs(
                ('DAR', None), ('Validation', '../'), ('Simulator', None)
            ),
        },
    )
