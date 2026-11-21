from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm, PasswordResetForm, SetPasswordForm, UserCreationForm

BOOTSTRAP_INPUT = "form-control"

class StyledFieldsMixin:
    def style_fields(self):
        for field in self.fields.values():
            css = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{css} {BOOTSTRAP_INPUT}".strip()

class GDXAuthenticationForm(StyledFieldsMixin, AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={"autocomplete": "username", "autofocus": True, "placeholder": "Email or username"}))
    password = forms.CharField(strip=False, widget=forms.PasswordInput(attrs={"autocomplete": "current-password", "placeholder": "Password"}))
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs); self.style_fields()

class GDXRegistrationForm(StyledFieldsMixin, UserCreationForm):
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()
    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs); self.style_fields()
    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if get_user_model().objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("An account with this email address already exists.")
        return email

class GDXPasswordResetForm(StyledFieldsMixin, PasswordResetForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs); self.fields["email"].widget.attrs.update({"placeholder":"Email address", "autocomplete":"email"}); self.style_fields()

class GDXSetPasswordForm(StyledFieldsMixin, SetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs); self.style_fields()

class LockScreenForm(forms.Form):
    password = forms.CharField(strip=False, widget=forms.PasswordInput(attrs={"class":BOOTSTRAP_INPUT, "autocomplete":"current-password", "placeholder":"Password", "autofocus":True}))
