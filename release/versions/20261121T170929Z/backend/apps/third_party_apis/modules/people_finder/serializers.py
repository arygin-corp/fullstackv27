from rest_framework import serializers


class PeopleSearchQuerySerializer(serializers.Serializer):
    q = serializers.CharField(min_length=3, max_length=200)
    page_size = serializers.IntegerField(
        required=False, default=10, min_value=1, max_value=100
    )


class PeopleListQuerySerializer(serializers.Serializer):
    page_size = serializers.IntegerField(
        required=False, default=100, min_value=1, max_value=999
    )
    cursor = serializers.URLField(required=False, allow_blank=True, max_length=4000)
    display_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    department = serializers.CharField(required=False, allow_blank=True, max_length=255)
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    office_location = serializers.CharField(required=False, allow_blank=True, max_length=255)
    job_title = serializers.CharField(required=False, allow_blank=True, max_length=255)
    account_enabled = serializers.BooleanField(required=False, allow_null=True)
    sort_by = serializers.ChoiceField(
        required=False,
        default="display_name",
        choices=(
            "display_name",
            "given_name",
            "surname",
            "department",
            "job_title",
            "office_location",
            "user_principal_name",
        ),
    )
    sort_dir = serializers.ChoiceField(
        required=False, default="asc", choices=("asc", "desc")
    )
