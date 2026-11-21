from django.core.exceptions import PermissionDenied as DPD, ValidationError as DVE
from rest_framework import mixins,status,viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied,ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from ..services import ApprovalService,DefinitionService,ExportService,MetricsService,WorkflowEngine,WorkflowValidator
class DefinitionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes=(IsAuthenticated,); serializer_class=DefinitionSerializer; queryset=WorkflowDefinition.objects.prefetch_related('states','transitions__source','transitions__target'); lookup_field='key'
    @action(detail=True,methods=('get',))
    def validate(self,request,key=None): return Response({'errors':WorkflowValidator.validate(self.get_object())})
    @action(detail=True,methods=('post',))
    def publish(self,request,key=None):
        try: obj=DefinitionService.publish(self.get_object())
        except DVE as exc: raise ValidationError(exc.messages)
        return Response(self.get_serializer(obj).data)
    @action(detail=True,methods=('get',))
    def export(self,request,key=None): return Response(ExportService.export(self.get_object()))
    @action(detail=True,methods=('get',))
    def metrics(self,request,key=None): return Response(MetricsService.summary(self.get_object()))
class InstanceViewSet(mixins.ListModelMixin,mixins.RetrieveModelMixin,viewsets.GenericViewSet):
    permission_classes=(IsAuthenticated,); serializer_class=InstanceSerializer
    def get_queryset(self): return WorkflowInstance.objects.select_related('workflow','current_state').prefetch_related('events','assignments','approval_tasks')
    @action(detail=False,methods=('post',))
    def start(self,request):
        s=StartSerializer(data=request.data,context={'request':request}); s.is_valid(raise_exception=True); obj=s.save(); return Response(self.get_serializer(obj).data,status=201)
    @action(detail=True,methods=('get',),url_path='available-transitions')
    def available(self,request,pk=None): return Response(TransitionSerializer(WorkflowEngine.available_transitions(instance=self.get_object(),actor=request.user),many=True).data)
    @action(detail=True,methods=('post',))
    def transition(self,request,pk=None):
        s=ExecuteSerializer(data=request.data); s.is_valid(raise_exception=True)
        try: result=WorkflowEngine.transition(instance=self.get_object(),actor=request.user,request_meta={'ip':request.META.get('REMOTE_ADDR'),'user_agent':request.META.get('HTTP_USER_AGENT','')},**s.validated_data)
        except DPD as exc: raise PermissionDenied(str(exc))
        except DVE as exc: raise ValidationError(exc.messages)
        return Response(self.get_serializer(result.instance).data)
    @action(detail=True,methods=('post',))
    def rollback(self,request,pk=None):
        result=WorkflowEngine.rollback(instance=self.get_object(),event_id=request.data.get('event_id'),actor=request.user); return Response(self.get_serializer(result.instance).data)
    @action(detail=True,methods=('post',))
    def comment(self,request,pk=None):
        s=CommentSerializer(data={**request.data,'instance':self.get_object().pk}); s.is_valid(raise_exception=True); obj=s.save(author=request.user); return Response(CommentSerializer(obj).data,status=201)
class ApprovalTaskViewSet(mixins.ListModelMixin,mixins.RetrieveModelMixin,viewsets.GenericViewSet):
    permission_classes=(IsAuthenticated,); serializer_class=ApprovalTaskSerializer
    def get_queryset(self): return ApprovalTask.objects.filter(assigned_to=self.request.user).select_related('instance','state')
    @action(detail=True,methods=('post',))
    def decide(self,request,pk=None):
        s=DecisionSerializer(data=request.data); s.is_valid(raise_exception=True); return Response(ApprovalService.decide(task=self.get_object(),actor=request.user,**s.validated_data))
