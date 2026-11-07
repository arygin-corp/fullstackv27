from django import forms
from .models import AudienceCondition, DynamicAudience, NotificationRule

class DynamicAudienceForm(forms.ModelForm):
    class Meta:
        model = DynamicAudience
        fields = (
            "name",
            "description",
            "application",
            "is_active",
            "include_user_ids",
            "exclude_user_ids",
        )
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3}),
            "include_user_ids": forms.Textarea(attrs={"rows": 3, "placeholder": "[1, 2, 3]"}),
            "exclude_user_ids": forms.Textarea(attrs={"rows": 3, "placeholder": "[4, 5]"}),
        }

    def clean_include_user_ids(self):
        return self._clean_id_list("include_user_ids")

    def clean_exclude_user_ids(self):
        return self._clean_id_list("exclude_user_ids")

    def _clean_id_list(self, field_name):
        values = self.cleaned_data.get(field_name) or []
        if not isinstance(values, list) or any(not isinstance(value, int) for value in values):
            raise forms.ValidationError("Use a JSON list of integer user IDs.")
        return list(dict.fromkeys(values))


class AudienceConditionForm(forms.ModelForm):
    class Meta:
        model = AudienceCondition
        fields = ("field", "operator", "value")

    def clean(self):
        cleaned = super().clean()
        if self.errors:
            return cleaned
        from .services.audiences import validate_condition

        instance = AudienceCondition(
            audience=self.instance.audience,
            field=cleaned.get("field", ""),
            operator=cleaned.get("operator", ""),
            value=cleaned.get("value"),
        )
        validate_condition(instance)
        return cleaned


class NotificationRuleForm(forms.ModelForm):
    class Meta:
        model = NotificationRule
        fields = (
            "name",
            "priority",
            "is_active",
            "notification_type",
            "source",
            "title_contains",
            "action",
            "stop_processing",
            "application",
        )





class NotificationTemplateForm(forms.Form):
    key = forms.CharField(
        max_length=200,
        required=True,
        label="Template Key"
    )

    description = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 3})
    )

    default_locale = forms.CharField(
        max_length=20,
        initial="en-US"
    )

    allowed_variables = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"rows": 4})
    )

    status = forms.ChoiceField(
        choices=[
            ("draft", "Draft"),
            ("active", "Active"),
            ("retired", "Retired"),
        ],
        initial="draft"
    )



class NotificationTemplateVersionForm(forms.Form):
    version_name = forms.CharField(
        label="Version Name",
        max_length=100,
        required=True,
        help_text="Human-readable version label."
    )

    locale = forms.CharField(
        label="Locale",
        max_length=20,
        initial="en-US",
        required=True,
    )

    subject = forms.CharField(
        label="Subject",
        max_length=255,
        required=False,
    )

    preheader = forms.CharField(
        label="Preheader",
        max_length=255,
        required=False,
    )

    email_html = forms.CharField(
        label="Email HTML",
        widget=forms.Textarea(attrs={"rows": 10}),
        required=False,
    )

    email_text = forms.CharField(
        label="Email Text",
        widget=forms.Textarea(attrs={"rows": 8}),
        required=False,
    )

    sms_body = forms.CharField(
        label="SMS Content",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    push_title = forms.CharField(
        label="Push Title",
        max_length=200,
        required=False,
    )

    push_body = forms.CharField(
        label="Push Body",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    in_app_title = forms.CharField(
        label="In-App Title",
        max_length=200,
        required=False,
    )

    in_app_body = forms.CharField(
        label="In-App Body",
        widget=forms.Textarea(attrs={"rows": 4}),
        required=False,
    )

    teams_title = forms.CharField(
        label="Teams Title",
        max_length=200,
        required=False,
    )

    teams_body = forms.CharField(
        label="Teams Message",
        widget=forms.Textarea(attrs={"rows": 6}),
        required=False,
    )

    digest_section_title = forms.CharField(
        label="Digest Section Title",
        max_length=200,
        required=False,
    )

    digest_content = forms.CharField(
        label="Digest Content",
        widget=forms.Textarea(attrs={"rows": 8}),
        required=False,
    )

    changelog = forms.CharField(
        label="Version Notes",
        widget=forms.Textarea(attrs={"rows": 3}),
        required=False,
    )

    is_default = forms.BooleanField(
        label="Default Version",
        required=False,
    )

    activate_on_save = forms.BooleanField(
        label="Activate Version",
        required=False,
    )

    def clean(self):
        cleaned = super().clean()

        if not any(
            [
                cleaned.get("email_html"),
                cleaned.get("email_text"),
                cleaned.get("sms_body"),
                cleaned.get("push_body"),
                cleaned.get("in_app_body"),
                cleaned.get("teams_body"),
                cleaned.get("digest_content"),
            ]
        ):
            raise forms.ValidationError(
                "At least one channel content field must be populated."
            )

        return cleaned

class BulkActionForm(forms.Form):
    ids = forms.CharField()
    action = forms.ChoiceField(
        choices=[
            (x, x.title())
            for x in [
                "read",
                "unread",
                "archive",
                "restore",
                "pin",
                "unpin",
                "snooze",
                "dismiss",
            ]
        ]
    )
    snoozed_until = forms.DateTimeField(required=False)

    def clean_ids(self):
        return [
            int(x) for x in self.cleaned_data["ids"].split(",") if x.strip().isdigit()
        ]


class SavedViewForm(forms.Form):
    name = forms.CharField(max_length=120)
    is_default = forms.BooleanField(required=False)


class RecommendationFeedbackForm(forms.Form):
    helpful = forms.NullBooleanField(required=False)
    outcome = forms.ChoiceField(
        required=False,
        choices=[
            ("", ""),
            ("accepted", "Accepted"),
            ("dismissed", "Dismissed"),
            ("ignored", "Ignored"),
            ("reverted", "Reverted"),
        ],
    )
    comment = forms.CharField(required=False, max_length=500)
