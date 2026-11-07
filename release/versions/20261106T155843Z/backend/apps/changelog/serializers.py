from rest_framework import serializers
from .models import Categorie, Post
from .validators import rich_text_has_content

class ChangelogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_by", "updated_at"]

class ChangelogPostSerializer(serializers.ModelSerializer):
    typeA_name = serializers.CharField(source="typeA.name", read_only=True, allow_null=True)
    typeB_name = serializers.CharField(source="typeB.name", read_only=True, allow_null=True)
    typeC_name = serializers.CharField(source="typeC.name", read_only=True, allow_null=True)
    typeD_name = serializers.CharField(source="typeD.name", read_only=True, allow_null=True)
    typeE_name = serializers.CharField(source="typeE.name", read_only=True, allow_null=True)
    typeF_name = serializers.CharField(source="typeF.name", read_only=True, allow_null=True)
    typeG_name = serializers.CharField(source="typeG.name", read_only=True, allow_null=True)
    typeH_name = serializers.CharField(source="typeH.name", read_only=True, allow_null=True)
    typeI_name = serializers.CharField(source="typeI.name", read_only=True, allow_null=True)
    typeJ_name = serializers.CharField(source="typeJ.name", read_only=True, allow_null=True)
    class Meta:
        model = Post
        fields = ["id", "version", "release_date", "title", "desc", "subTitleA", "typeA", "typeA_name", "postA", "subTitleB", "typeB", "typeB_name", "postB", "subTitleC", "typeC", "typeC_name", "postC", "subTitleD", "typeD", "typeD_name", "postD", "subTitleE", "typeE", "typeE_name", "postE", "subTitleF", "typeF", "typeF_name", "postF", "subTitleG", "typeG", "typeG_name", "postG", "subTitleH", "typeH", "typeH_name", "postH", "subTitleI", "typeI", "typeI_name", "postI", "subTitleJ", "typeJ", "typeJ_name", "postJ", "is_active", "status", "publish_at", "submitted_by", "submitted_at", "approved_by", "approved_at", "published_at", "created_by", "created_at", "updated_by", "updated_at"]
        read_only_fields = ["id", "status", "is_active", "submitted_by", "submitted_at", "approved_by", "approved_at", "published_at", "created_by", "created_at", "updated_by", "updated_at"]

    def validate(self, attrs):
        errors = {}
        for letter in "ABCDEFGHIJ":
            category_name = f"type{letter}"
            content_name = f"post{letter}"
            category = attrs.get(category_name, getattr(self.instance, category_name, None))
            content = attrs.get(content_name, getattr(self.instance, content_name, None))
            if rich_text_has_content(content) and not category:
                errors[category_name] = f"Section {letter} requires a category when content is provided."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

CategorieSerializer = ChangelogCategorySerializer
PostSerializer = ChangelogPostSerializer
