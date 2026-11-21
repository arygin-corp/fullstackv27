import json
from django import forms
from django.core.exceptions import ValidationError
from .content_rendering import validate_block_payload
from .models import ContentBlock


from crispy_forms.helper import FormHelper
from allauth.account.forms import LoginForm, SignupForm, ChangePasswordForm, ResetPasswordForm, ResetPasswordKeyForm, SetPasswordForm
from django.contrib.auth.forms import AuthenticationForm
from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from crispy_forms.helper import FormHelper
from allauth.account.forms import LoginForm, SignupForm, ChangePasswordForm, ResetPasswordForm, ResetPasswordKeyForm, \
    SetPasswordForm


class UserLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super(UserLoginForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)

        # Safely update widgets if fields exist
        if 'login' in self.fields:
            self.fields['login'].widget = forms.TextInput(attrs={
                'class': 'form-control mb-2',
                'placeholder': 'Enter Username',
                'id': 'username'
            })
        if 'password' in self.fields:
            self.fields['password'].widget = forms.PasswordInput(attrs={
                'class': 'form-control mb-2',
                'placeholder': 'Enter Password',
                'id': 'password'
            })
        if 'remember' in self.fields:
            self.fields['remember'].widget = forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })


class UserRegistrationForm(SignupForm):
    def __init__(self, *args, **kwargs):
        super(UserRegistrationForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        if 'email' in self.fields:
            self.fields['email'].widget = forms.EmailInput(
                attrs={'class': 'form-control mb-1', 'placeholder': 'Enter Email', 'id': 'email'})
            self.fields['email'].label = "Email"
        if 'username' in self.fields:
            self.fields['username'].widget = forms.TextInput(
                attrs={'class': 'form-control mb-1', 'placeholder': 'Enter Username', 'id': 'username1'})
        if 'password1' in self.fields:
            self.fields['password1'].widget = forms.PasswordInput(
                attrs={'class': 'form-control mb-1', 'placeholder': 'Enter Password', 'id': 'password1'})
        if 'password2' in self.fields:
            self.fields['password2'].widget = forms.PasswordInput(
                attrs={'class': 'form-control mb-1', 'placeholder': 'Enter Confirm Password', 'id': 'password2'})
            self.fields['password2'].label = "Confirm Password"


class PasswordChangeForm(ChangePasswordForm):
    def __init__(self, *args, **kwargs):
        super(PasswordChangeForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)

        # allauth uses 'old_password' with an underscore
        old_pwd_field = 'old_password' if 'old_password' in self.fields else 'oldpassword'
        if old_pwd_field in self.fields:
            self.fields[old_pwd_field].widget = forms.PasswordInput(
                attrs={'class': 'form-control mb-2', 'placeholder': 'Enter current password', 'id': 'password3'})

        if 'password1' in self.fields:
            self.fields['password1'].widget = forms.PasswordInput(
                attrs={'class': 'form-control mb-2', 'placeholder': 'Enter new password', 'id': 'password4'})
        if 'password2' in self.fields:
            self.fields['password2'].widget = forms.PasswordInput(
                attrs={'class': 'form-control mb-2', 'placeholder': 'Enter confirm password', 'id': 'password5'})
            self.fields['password2'].label = "Confirm Password"

class PasswordResetForm(ResetPasswordForm):
      def __init__(self, *args, **kwargs):
        super(PasswordResetForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)

        self.fields['email'].widget = forms.EmailInput(attrs={'class': 'form-control mb-2','placeholder':' Enter Email','id':'email1'})
        self.fields['email'].label="Email"
class PasswordResetKeyForm(ResetPasswordKeyForm):
      def __init__(self, *args, **kwargs):
        super(PasswordResetKeyForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.fields['password1'].widget = forms.PasswordInput(attrs={'class': 'form-control mb-2','placeholder':'Enter new password','id':'password6'})
        self.fields['password2'].widget = forms.PasswordInput(attrs={'class': 'form-control mb-1','placeholder':'Enter confirm password','id':'password7'})
        self.fields['password2'].label="Confirm Password"
class PasswordSetForm(SetPasswordForm):
      def __init__(self, *args, **kwargs):
        super(PasswordSetForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.fields['password1'].widget = forms.PasswordInput(attrs={'class': 'form-control mb-2','placeholder':'Enter new password','id':'password8'})
        self.fields['password2'].widget = forms.PasswordInput(attrs={'class': 'form-control','placeholder':'Enter confirm password','id':'password9'})
        self.fields['password2'].label="Confirm Password"








class StyledFormMixin:
    def apply_styles(self):
        for field in self.fields.values():
            field.widget.attrs.setdefault("class", "form-check-input" if isinstance(field.widget, forms.CheckboxInput) else "form-select" if isinstance(field.widget, forms.Select) else "form-control")

class ContentBlockForm(StyledFormMixin, forms.ModelForm):
    content = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 18, "spellcheck": "true"}),
        help_text="Plain text, Markdown, rich text, or restricted HTML according to the selected block type.",
    )

    class Meta:
        model = ContentBlock
        fields = ("block_type", "label", "position", "is_enabled")

    def __init__(self, *args, page_type=None, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.page_type = page_type
        self.user = user
        if self.instance and self.instance.pk:
            self.fields["content"].initial = self.instance.payload.get("content", "")
        if not page_type or not page_type.allow_restricted_html:
            self.fields["block_type"].choices = [choice for choice in ContentBlock.Type.choices if choice[0] != ContentBlock.Type.HTML]
        self.apply_styles()

    def clean_block_type(self):
        value = self.cleaned_data["block_type"]
        if value == ContentBlock.Type.HTML:
            if not self.page_type or not self.page_type.allow_restricted_html:
                raise ValidationError("Restricted HTML is disabled for this page type.")
            if not self.user or not (self.user.is_superuser or self.user.has_perm("pages.add_restricted_html_block")):
                raise ValidationError("You do not have permission to create restricted HTML blocks.")
        return value

    def clean(self):
        cleaned = super().clean()
        kind = cleaned.get("block_type")
        if kind:
            cleaned["payload"] = validate_block_payload(kind, {"content": cleaned.get("content", "")})
        return cleaned

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.payload = self.cleaned_data["payload"]
        if commit:
            instance.save()
        return instance

class ContentBlockReorderForm(forms.Form):
    ordered_ids = forms.CharField(widget=forms.HiddenInput)

    def __init__(self, *args, version=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.version = version

    def clean_ordered_ids(self):
        try:
            values = json.loads(self.cleaned_data["ordered_ids"])
        except (TypeError, ValueError, json.JSONDecodeError) as exc:
            raise ValidationError("The block order must be a JSON array.") from exc
        if not isinstance(values, list) or len(values) != len(set(values)):
            raise ValidationError("The block order contains invalid or duplicate IDs.")
        actual = {str(value) for value in self.version.blocks.values_list("pk", flat=True)}
        if set(values) != actual:
            raise ValidationError("The block order must contain every block in this version exactly once.")
        return values
from .models import Page,PageType,PageVersion,Approval,LifecycleRequest
class PageTypeForm(StyledFormMixin,forms.ModelForm):
    class Meta:model=PageType;fields=("name","code","description","is_active","allow_restricted_html")
    def __init__(self,*a,**k):super().__init__(*a,**k);self.apply_styles()
class PageForm(StyledFormMixin,forms.ModelForm):
    class Meta:model=Page;fields=("title","slug","page_type","locale")
    def __init__(self,*a,**k):super().__init__(*a,**k);self.fields["page_type"].queryset=PageType.objects.filter(is_active=True);self.apply_styles()
class VersionForm(StyledFormMixin,forms.ModelForm):
    class Meta:model=PageVersion;fields=("title","summary")
    def __init__(self,*a,**k):super().__init__(*a,**k);self.apply_styles()
class DecisionForm(StyledFormMixin,forms.Form):
    decision=forms.ChoiceField(choices=Approval.Decision.choices);comment=forms.CharField(min_length=25,widget=forms.Textarea)
    def __init__(self,*a,**k):super().__init__(*a,**k);self.apply_styles()
class LifecycleRequestForm(StyledFormMixin,forms.ModelForm):
    class Meta:model=LifecycleRequest;fields=("request_type","reason")
    def __init__(self,*a,**k):super().__init__(*a,**k);self.apply_styles()
