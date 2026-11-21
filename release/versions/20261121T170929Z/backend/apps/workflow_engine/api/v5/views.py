from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...automation.models import AutomationFlow,FlowExecution
from ...automation.engine import AutomationEngine
from ...connector_marketplace.models import Connector,ConnectorInstallation
from ...operations.models import OperationalCommand
from ...observability_v2.models import TelemetryEvent,AlertIncident
class AutoSerializer(serializers.ModelSerializer):
 class Meta:fields='__all__'
def ser(model):return type(model.__name__+'Serializer',(AutoSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class FlowViewSet(viewsets.ModelViewSet):
 queryset=AutomationFlow.objects.all();serializer_class=ser(AutomationFlow);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('get',))
 def validate(self,request,pk=None):return Response({'errors':AutomationEngine.validate(self.get_object())})
 @action(detail=True,methods=('post',))
 def execute(self,request,pk=None):obj=AutomationEngine.start(self.get_object(),request.data.get('payload',{}),request.headers.get('Idempotency-Key',''));return Response(ser(FlowExecution)(obj).data)
class ConnectorViewSet(viewsets.ReadOnlyModelViewSet):queryset=Connector.objects.filter(status='published');serializer_class=ser(Connector);permission_classes=(IsAuthenticated,)
class OperationsViewSet(viewsets.ModelViewSet):queryset=OperationalCommand.objects.all();serializer_class=ser(OperationalCommand);permission_classes=(IsAuthenticated,)
class TelemetryViewSet(viewsets.ReadOnlyModelViewSet):queryset=TelemetryEvent.objects.order_by('-occurred_at');serializer_class=ser(TelemetryEvent);permission_classes=(IsAuthenticated,)
class IncidentViewSet(viewsets.ReadOnlyModelViewSet):queryset=AlertIncident.objects.order_by('-created_at');serializer_class=ser(AlertIncident);permission_classes=(IsAuthenticated,)
