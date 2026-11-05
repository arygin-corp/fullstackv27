from rest_framework import serializers
from .models import APIConfiguration, APIKey, FrontendApplication, PublishedEndpoint
class TDSPPodSerializer(serializers.Serializer):
    label = serializers.CharField(); value = serializers.CharField()
class PublishedEndpointSerializer(serializers.ModelSerializer):
    route = serializers.CharField(read_only=True)
    class Meta:
        model = PublishedEndpoint
        fields = ("id", "name", "public_slug", "public_version", "route", "authentication_mode", "required_scopes", "allowed_methods", "enabled", "deprecated_at", "retirement_at")
class APIKeyMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        exclude = ("secret_hash",)
        read_only_fields = tuple(field.name for field in APIKey._meta.fields if field.name != "secret_hash")
class APIConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIConfiguration
        fields = "__all__"
