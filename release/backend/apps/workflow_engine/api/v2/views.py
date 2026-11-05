from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...bpmn import BPMNService
from ...models import WorkflowDefinition
from ...platform_models import Policy,PolicyException,RiskAssessment,Tenant
from ...process_mining import ProcessMiningService
class SimpleSerializer(serializers.ModelSerializer):
 class Meta: fields='__all__'
def serializer_for(model):
 return type(model.__name__+'Serializer',(SimpleSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class TenantViewSet(viewsets.ModelViewSet):queryset=Tenant.objects.all();serializer_class=serializer_for(Tenant);permission_classes=(IsAuthenticated,)
class PolicyViewSet(viewsets.ModelViewSet):queryset=Policy.objects.all();serializer_class=serializer_for(Policy);permission_classes=(IsAuthenticated,)
class ExceptionViewSet(viewsets.ModelViewSet):queryset=PolicyException.objects.all();serializer_class=serializer_for(PolicyException);permission_classes=(IsAuthenticated,)
class RiskViewSet(viewsets.ModelViewSet):queryset=RiskAssessment.objects.all();serializer_class=serializer_for(RiskAssessment);permission_classes=(IsAuthenticated,)
class PlatformDefinitionViewSet(viewsets.ReadOnlyModelViewSet):
 queryset=WorkflowDefinition.objects.all();serializer_class=serializer_for(WorkflowDefinition);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('get',))
 def process_mining(self,request,pk=None):
  w=self.get_object();return Response({'variants':ProcessMiningService.variants(w),'rework':ProcessMiningService.rework(w)})
 @action(detail=True,methods=('get',))
 def bpmn(self,request,pk=None):return Response({'xml':BPMNService.export(self.get_object())})
