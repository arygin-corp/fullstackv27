from django import forms
from .models import Categorie, Post
from .validators import rich_text_has_content

class DateTimeLocalInput(forms.DateTimeInput):
    input_type = "datetime-local"

class StyledModelForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            css = "form-check-input" if isinstance(field.widget, forms.CheckboxInput) else "form-control"
            field.widget.attrs["class"] = f"{field.widget.attrs.get('class', '')} {css}".strip()

class CategorieForm(StyledModelForm):
    class Meta:
        model = Categorie
        fields = ["name", "slug", "published_date", "desc", "is_active"]
        widgets = {"published_date": DateTimeLocalInput(format="%Y-%m-%dT%H:%M")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["published_date"].input_formats = ["%Y-%m-%dT%H:%M"]

class PostForm(StyledModelForm):
    class Meta:
        model = Post
        exclude = ["created_by", "created_at", "updated_by", "updated_at", "status", "is_active", "submitted_by", "submitted_at", "approved_by", "approved_at", "published_at"]
        widgets = {"release_date": DateTimeLocalInput(format="%Y-%m-%dT%H:%M")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["release_date"].input_formats = ["%Y-%m-%dT%H:%M"]

    def clean(self):
        cleaned = super().clean()
        for letter in "ABCDEFGHIJ":
            category = cleaned.get(f"type{letter}")
            content = cleaned.get(f"post{letter}")
            if rich_text_has_content(content) and not category:
                self.add_error(f"type{letter}", f"Section {letter} requires a category when content is provided.")
        return cleaned

EditCategorieForm = CategorieForm
EditPostForm = PostForm


class ReleaseScheduleForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["publish_at"]
        widgets = {"publish_at": DateTimeLocalInput(format="%Y-%m-%dT%H:%M")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["publish_at"].input_formats = ["%Y-%m-%dT%H:%M"]
