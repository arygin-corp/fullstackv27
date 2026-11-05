from rest_framework import serializers,status,viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied,ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...authorization import WorkflowAuthorization
from ...models import WorkflowInstance
from ...serializers import InstanceSerializer,ExecuteSerializer,DecisionSerializer
from ...services import WorkflowEngine,ApprovalService
class SecureInstanceViewSet(viewsets.ReadOnlyModelViewSet):
 permission_classes=(IsAuthenticated,);serializer_class=InstanceSerializer
 def _tenant(self):
  tenant=getattr(self.request,'tenant',None)
  if not tenant:raise PermissionDenied('Tenant context is required.')
  return tenant
 def get_queryset(self):return WorkflowAuthorization.filter_instances(user=self.request.user,tenant=self._tenant()).select_related('workflow','current_state')
 def _require(self,obj,action,role=''):
  if not WorkflowAuthorization.allowed(user=self.request.user,tenant=self._tenant(),action=action,workflow=obj.workflow,instance=obj,state=obj.current_state,role=role):raise PermissionDenied('Active dedicated staffing and authorized group membership are required.')
 @action(detail=True,methods=('post',))
 def transition(self,request,pk=None):
  obj=self.get_object();self._require(obj,'transition');s=ExecuteSerializer(data=request.data);s.is_valid(raise_exception=True);result=WorkflowEngine.transition(instance=obj,actor=request.user,**s.validated_data);return Response(self.get_serializer(result.instance).data)
 @action(detail=True,methods=('post',))
 def rollback(self,request,pk=None):
  obj=self.get_object();self._require(obj,'rollback');result=WorkflowEngine.rollback(instance=obj,event_id=request.data.get('event_id'),actor=request.user);return Response(self.get_serializer(result.instance).data)
