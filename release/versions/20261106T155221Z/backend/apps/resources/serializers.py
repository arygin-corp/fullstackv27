from rest_framework import serializers
from .models import Brand, Document, Homepage, Media, Policie, Processe, ResourceAnalytics, ResourceApprovalAudit, ResourceChangeAttachment, ResourceChangeRequest, ResourceVersion
from .services.core import validate_proposal

class ResourceSerializer(serializers.ModelSerializer):
    archived_by=serializers.PrimaryKeyRelatedField(read_only=True)
    created_by=serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by=serializers.PrimaryKeyRelatedField(read_only=True)

class HomepageSerializer(ResourceSerializer):
    class Meta: model=Homepage; fields='__all__'
class BrandSerializer(ResourceSerializer):
    class Meta: model=Brand; fields='__all__'
class DocumentSerializer(ResourceSerializer):
    contentUrl=serializers.CharField(source='content_url',read_only=True)
    class Meta: model=Document; fields='__all__'
class PolicieSerializer(ResourceSerializer):
    class Meta: model=Policie; fields='__all__'
class ProcesseSerializer(ResourceSerializer):
    class Meta: model=Processe; fields='__all__'
class MediaSerializer(ResourceSerializer):
    class Meta: model=Media; fields='__all__'
class ResourceChangeAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by=serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta: model=ResourceChangeAttachment; fields='__all__'; read_only_fields=('change_request',)
class ResourceChangeRequestSerializer(serializers.ModelSerializer):
    submitter=serializers.PrimaryKeyRelatedField(read_only=True); approver=serializers.PrimaryKeyRelatedField(read_only=True)
    attachments=ResourceChangeAttachmentSerializer(many=True,read_only=True)
    class Meta:
        model=ResourceChangeRequest; fields='__all__'
        read_only_fields=('status','submitted_at','decided_at','applied_at')
    def validate(self,attrs):
        instance=self.instance or ResourceChangeRequest(submitter=self.context['request'].user)
        for key,value in attrs.items(): setattr(instance,key,value)
        validate_proposal(instance); return attrs
class ResourceApprovalAuditSerializer(serializers.ModelSerializer):
    class Meta: model=ResourceApprovalAudit; fields='__all__'
class ResourceVersionSerializer(serializers.ModelSerializer):
    version=serializers.CharField(read_only=True)
    class Meta: model=ResourceVersion; fields='__all__'
class ResourceAnalyticsSerializer(serializers.ModelSerializer):
    class Meta: model=ResourceAnalytics; fields='__all__'
