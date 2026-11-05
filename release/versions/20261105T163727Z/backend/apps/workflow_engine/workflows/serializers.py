from rest_framework import serializers
from ..models import *
from ..services import WorkflowEngine
class StateSerializer(serializers.ModelSerializer):
    class Meta: model=WorkflowState; fields='__all__'
class TransitionSerializer(serializers.ModelSerializer):
    source_key=serializers.CharField(source='source.key',read_only=True); target_key=serializers.CharField(source='target.key',read_only=True)
    class Meta: model=WorkflowTransition; fields='__all__'
class EventSerializer(serializers.ModelSerializer):
    class Meta: model=TransitionEvent; fields='__all__'
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta: model=WorkflowAssignment; fields='__all__'
class ApprovalTaskSerializer(serializers.ModelSerializer):
    class Meta: model=ApprovalTask; fields='__all__'
class InstanceSerializer(serializers.ModelSerializer):
    events=EventSerializer(many=True,read_only=True); assignments=AssignmentSerializer(many=True,read_only=True); approval_tasks=ApprovalTaskSerializer(many=True,read_only=True)
    class Meta: model=WorkflowInstance; fields='__all__'; read_only_fields=('current_state','status','due_at','completed_at','revision','created_by')
class DefinitionSerializer(serializers.ModelSerializer):
    states=StateSerializer(many=True,read_only=True); transitions=TransitionSerializer(many=True,read_only=True)
    class Meta: model=WorkflowDefinition; fields='__all__'
class StartSerializer(serializers.Serializer):
    workflow_key=serializers.SlugField(); version=serializers.IntegerField(required=False); context=serializers.JSONField(default=dict); external_id=serializers.CharField(default='',allow_blank=True); correlation_id=serializers.CharField(default='',allow_blank=True)
    def create(self,d):
        q=WorkflowDefinition.objects.filter(key=d.pop('workflow_key'),lifecycle='published'); version=d.pop('version',None)
        if version is not None: q=q.filter(version=version)
        workflow=q.order_by('-version').first()
        if not workflow: raise serializers.ValidationError('Published workflow not found.')
        return WorkflowEngine.start(workflow=workflow,actor=self.context['request'].user,**d)
class ExecuteSerializer(serializers.Serializer): transition_key=serializers.SlugField(); payload=serializers.JSONField(default=dict)
class DecisionSerializer(serializers.Serializer): decision=serializers.ChoiceField(choices=('approved','rejected')); comment=serializers.CharField(required=False,allow_blank=True,default='')
class CommentSerializer(serializers.ModelSerializer):
    class Meta: model=WorkflowComment; fields='__all__'; read_only_fields=('author',)
