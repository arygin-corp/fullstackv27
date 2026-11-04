import json

from django import forms

from .models import AwsEnvironmentConfig, AwsResourceConfig


class AwsEnvironmentConfigForm(forms.ModelForm):
    class Meta:
        model = AwsEnvironmentConfig
        fields = ("account_alias", "account_id", "region", "role_arn", "enabled")
        widgets = {
            "account_alias": forms.TextInput(attrs={"class": "form-control"}),
            "account_id": forms.TextInput(attrs={"class": "form-control", "inputmode": "numeric", "maxlength": "12"}),
            "region": forms.TextInput(attrs={"class": "form-control", "placeholder": "us-east-1"}),
            "role_arn": forms.TextInput(attrs={"class": "form-control", "placeholder": "arn:aws:iam::123456789012:role/..."}),
        }

    def clean_account_id(self):
        value = self.cleaned_data["account_id"].strip()
        if value and (len(value) != 12 or not value.isdigit()):
            raise forms.ValidationError("AWS account ID must contain exactly 12 digits.")
        return value


class AwsResourceConfigForm(forms.ModelForm):
    settings_json = forms.CharField(
        required=False,
        label="Resource settings",
        widget=forms.Textarea(attrs={"class": "form-control font-monospace", "rows": 12}),
        help_text="Service-specific JSON consumed by the AWS service adapter.",
    )

    class Meta:
        model = AwsResourceConfig
        fields = ("resource_type", "name", "region", "enabled")
        widgets = {
            "resource_type": forms.Select(attrs={"class": "form-select"}),
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "Resource name or identifier"}),
            "region": forms.TextInput(attrs={"class": "form-control", "placeholder": "Inherit environment region when blank"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["settings_json"].initial = json.dumps(self.instance.settings or {}, indent=2, sort_keys=True)
        else:
            self.fields["settings_json"].initial = "{}"

    def clean_settings_json(self):
        raw = (self.cleaned_data.get("settings_json") or "{}").strip()
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise forms.ValidationError(f"Invalid JSON: {exc.msg} (line {exc.lineno}, column {exc.colno}).") from exc
        if not isinstance(value, dict):
            raise forms.ValidationError("Resource settings must be a JSON object.")
        return value

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.settings = self.cleaned_data["settings_json"]
        if commit:
            instance.save()
        return instance
