from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...inbox.models import WorkItem
from ...inbox.services import InboxService
from ...portal.models import ServiceOffering
from ...replay.services import ReplayService
from ...health.services import HealthService
from ...genome.services import GenomeService
from ...models import WorkflowDefinition,WorkflowInstance
class AutoSerializer(serializers.ModelSerializer):
 class Meta:fields='__all__'
def ser(model):return type(model.__name__+'Serializer',(AutoSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class OfferingViewSet(viewsets.ReadOnlyModelViewSet):queryset=ServiceOffering.objects.filter(active=True);serializer_class=ser(ServiceOffering);permission_classes=(IsAuthenticated,)
class InboxViewSet(viewsets.ReadOnlyModelViewSet):
 serializer_class=ser(WorkItem);permission_classes=(IsAuthenticated,)
 def get_queryset(self):return InboxService.for_user(WorkItem.objects.all(),self.request.user)
class OperationsViewSet(viewsets.ReadOnlyModelViewSet):
 queryset=WorkflowDefinition.objects.all();serializer_class=ser(WorkflowDefinition);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('post',))
 def health(self,request,pk=None):obj=HealthService.calculate(self.get_object());return Response({'id':obj.pk,'score':obj.score,'status':obj.status,'signals':obj.signals})
 @action(detail=True,methods=('post',))
 def genome(self,request,pk=None):obj=GenomeService.calculate(self.get_object());return Response({'id':obj.pk,'features':obj.features})
class ReplayViewSet(viewsets.ReadOnlyModelViewSet):
 queryset=WorkflowInstance.objects.all();serializer_class=ser(WorkflowInstance);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('post',))
 def replay(self,request,pk=None):return Response(ReplayService.reconstruct(self.get_object(),request.data.get('sequence')))
