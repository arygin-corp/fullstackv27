import json
from django import forms
from .models import FormDefinition

class JsonPayloadForm(forms.Form):
    form = forms.ModelChoiceField(queryset=FormDefinition.objects.filter(is_active=True).order_by('name', 'version'), empty_label='Select a form')
    payload = forms.CharField(label='Field values', help_text='Enter a JSON object keyed by field key, for example {"v_dar_platform": "Snowflake"}.', widget=forms.Textarea(attrs={'class': 'form-control font-monospace', 'rows': 12}), initial='{}')

    def clean_payload(self):
        value = self.cleaned_data['payload']
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as exc:
            raise forms.ValidationError(f'Invalid JSON: {exc.msg} at line {exc.lineno}, column {exc.colno}.') from exc
        if not isinstance(parsed, dict):
            raise forms.ValidationError('Payload must be a JSON object keyed by field key.')
        return parsed
