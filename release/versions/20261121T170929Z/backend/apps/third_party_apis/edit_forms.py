import json
from django import forms
from django.core.exceptions import ValidationError
from .models import InstalledThirdPartyApi
ALLOWED_ICON_CONTENT_TYPES={"image/png","image/jpeg","image/webp"}
MAX_ICON_BYTES=2*1024*1024
MAX_SOURCE_LOGO_BYTES=4*1024*1024
class IntegrationMetadataForm(forms.ModelForm):
    config_text=forms.CharField(required=False)
    class Meta:model=InstalledThirdPartyApi;fields=("name","description","source_name","enabled")
    def clean_config_text(self):
        raw=self.cleaned_data.get("config_text","").strip()
        if not raw:return {}
        try:data=json.loads(raw)
        except json.JSONDecodeError as exc:raise ValidationError(f"Invalid JSON: {exc.msg}") from exc
        if not isinstance(data,dict):raise ValidationError("Operational overrides must be a JSON object.")
        return data
    def save(self,commit=True):
        obj=super().save(commit=False);obj.config=self.cleaned_data["config_text"]
        if commit:obj.save()
        return obj
def validate_uploaded_image(upload,max_bytes):
    if upload is None:return
    if getattr(upload,"content_type","") not in ALLOWED_ICON_CONTENT_TYPES:raise ValidationError("Upload PNG, JPEG or WebP.")
    if upload.size>max_bytes:raise ValidationError("Image is too large.")
