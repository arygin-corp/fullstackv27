from rest_framework import serializers


class EvaluationBuildSerializer(serializers.Serializer):

    source_mode = serializers.ChoiceField(
        choices=(
            "django",
            "files",
            "both"
        ),
        default="both"
    )

    provider = serializers.ChoiceField(
        choices=(
            "none",
            "ollama",
            "openai-compatible"
        ),
        default="none"
    )

    endpoint = serializers.CharField(
        required=False,
        allow_blank=True
    )

    model = serializers.CharField(
        required=False,
        allow_blank=True
    )

    api_key = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )

    require_human_approval = serializers.BooleanField(
        default=False
    )

    require_same_chunk = serializers.BooleanField(
        default=False
    )

    allow_source_only = serializers.BooleanField(
        default=False
    )

    resume = serializers.BooleanField(
        default=False
    )

    limit_documents = serializers.IntegerField(
        required=False,
        min_value=1
    )

    limit_files = serializers.IntegerField(
        required=False,
        min_value=1
    )

    questions_per_chunk = serializers.IntegerField(
        required=False,
        min_value=1,
        default=2
    )

    chunks_per_document = serializers.IntegerField(
        required=False,
        min_value=1,
        default=4
    )

    max_cases_per_document = serializers.IntegerField(
        required=False,
        min_value=1,
        default=12
    )

    data_dir = serializers.CharField(
        required=False,
        allow_blank=True
    )

    output_dir = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, attrs):

        provider = attrs.get(
            "provider",
            "none"
        )

        if provider != "none":

            if not attrs.get("model"):

                raise serializers.ValidationError(
                    {
                        "model":
                        "A model is required when using a provider."
                    }
                )

        return attrs