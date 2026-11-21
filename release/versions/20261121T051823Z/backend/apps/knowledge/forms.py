from pathlib import Path

from django import forms

from .loaders import LEARNING_EXTENSIONS, learning_accept
from .models import Document

_ACCEPT = learning_accept()


class DocumentUploadForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ("title", "source_file")
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "Title (optional)"}),
            "source_file": forms.ClearableFileInput(attrs={"class": "form-control", "accept": _ACCEPT}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["title"].required = False

    def clean_source_file(self):
        uploaded = self.cleaned_data["source_file"]
        suffix = Path(uploaded.name).suffix.lower()
        if suffix not in LEARNING_EXTENSIONS:
            raise forms.ValidationError("That file type is not supported for Vikki learning.")
        if uploaded.size > 20 * 1024 * 1024:
            raise forms.ValidationError("Maximum file size is 20 MB.")
        return uploaded


class KnowledgeTextForm(forms.Form):
    title = forms.CharField(
        max_length=255,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Title"}),
    )
    body = forms.CharField(
        widget=forms.Textarea(attrs={"class": "form-control", "rows": 8, "placeholder": "Write what Vikki should learn"}),
    )
