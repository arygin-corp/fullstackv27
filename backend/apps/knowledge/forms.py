from pathlib import Path
from django import forms
from .models import Document
class DocumentUploadForm(forms.ModelForm):
    class Meta: model=Document; fields=("title","source_file")
    def clean_source_file(self):
        f=self.cleaned_data["source_file"]
        if Path(f.name).suffix.lower() not in {".pdf",".docx",".txt",".md"}: raise forms.ValidationError("Use PDF, DOCX, TXT, or MD.")
        if f.size > 20*1024*1024: raise forms.ValidationError("Maximum file size is 20 MB.")
        return f
