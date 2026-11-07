from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...agent_marketplace.models import AgentPackage
from ...citizen_studio.models import CitizenProject
from ...citizen_studio.services import CitizenStudioService
from ...knowledge_fabric.models import FabricEntity
from ...process_discovery.models import DiscoveryProject
from ...governance_command.models import GovernanceSignal
from ...decision_intelligence.models import DecisionModel
from ...decision_intelligence.services import DecisionService
class AutoSerializer(serializers.ModelSerializer):
 class Meta:fields='__all__'
def ser(model):return type(model.__name__+'Serializer',(AutoSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class AgentStoreViewSet(viewsets.ReadOnlyModelViewSet):queryset=AgentPackage.objects.filter(status='published',verified=True);serializer_class=ser(AgentPackage);permission_classes=(IsAuthenticated,)
class CitizenStudioViewSet(viewsets.ModelViewSet):
 queryset=CitizenProject.objects.all();serializer_class=ser(CitizenProject);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('get',))
 def readiness(self,request,pk=None):return Response(CitizenStudioService.readiness(self.get_object()))
class FabricViewSet(viewsets.ReadOnlyModelViewSet):queryset=FabricEntity.objects.all();serializer_class=ser(FabricEntity);permission_classes=(IsAuthenticated,)
class DiscoveryViewSet(viewsets.ModelViewSet):queryset=DiscoveryProject.objects.all();serializer_class=ser(DiscoveryProject);permission_classes=(IsAuthenticated,)
class GovernanceSignalViewSet(viewsets.ReadOnlyModelViewSet):queryset=GovernanceSignal.objects.order_by('-created_at');serializer_class=ser(GovernanceSignal);permission_classes=(IsAuthenticated,)
class DecisionViewSet(viewsets.ReadOnlyModelViewSet):
 queryset=DecisionModel.objects.filter(status='published');serializer_class=ser(DecisionModel);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('post',))
 def evaluate(self,request,pk=None):return Response(DecisionService.execute(self.get_object(),request.data.get('facts',{})))
