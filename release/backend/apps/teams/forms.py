from django import forms
from django.contrib.auth import get_user_model

from .models import Team

User = get_user_model()


def person_label(user):
    name = (user.get_full_name() or "").strip()
    email = (getattr(user, "email", "") or "").strip()
    if name and email and email.lower() not in name.lower():
        return f"{name} · {email}"
    return name or email or user.get_username()


class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        fields = ["tenant", "name", "slug", "description", "icon", "logo", "cover_image", "owner", "members"]
        widgets = {
            "tenant": forms.Select(attrs={"class": "form-select"}),
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "slug": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 7}),
            "icon": forms.FileInput(attrs={"class": "form-control", "accept": "image/*,.svg,.svgz,.webp,.avif,.bmp,.ico,.tif,.tiff,.heic,.heif"}),
            "logo": forms.FileInput(attrs={"class": "form-control", "accept": "image/*,.svg,.svgz,.webp,.avif,.bmp,.ico,.tif,.tiff,.heic,.heif"}),
            "cover_image": forms.FileInput(attrs={"class": "form-control", "accept": "image/*,.svg,.svgz,.webp,.avif,.bmp,.ico,.tif,.tiff,.heic,.heif"}),
            "owner": forms.Select(attrs={"class": "form-select"}),
            "members": forms.CheckboxSelectMultiple(),
        }
        help_texts = {
            "slug": "Used in the team address. It is filled from the name when left blank on create.",
            "members": "Select everyone who belongs to this team.",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        people = User.objects.order_by("first_name", "last_name", "username")
        self.fields["owner"].queryset = people
        self.fields["owner"].label_from_instance = person_label
        self.fields["owner"].empty_label = "Select an owner"
        self.fields["members"].queryset = people
        self.fields["members"].label_from_instance = person_label
        self.fields["members"].required = False
        self.fields["slug"].required = False
        for name in ("description", "icon", "logo", "cover_image"):
            self.fields[name].required = False
