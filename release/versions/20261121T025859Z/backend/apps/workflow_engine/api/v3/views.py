from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...builder.models import BuildProject
from ...builder.services import BuilderService
from ...forms.models import DynamicForm,FormSubmission
from ...forms.services import FormService
from ...marketplace.models import WorkflowPackage,MarketplaceListing
from ...marketplace.services import MarketplaceService
from ...digital_twin.models import SimulationScenario,SimulationRun
from ...digital_twin.simulator import DigitalTwinSimulator
class AutoSerializer(serializers.ModelSerializer):
    class Meta:
        fields='__all__'
def ser(model):return type(model.__name__+'Serializer',(AutoSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class BuildProjectViewSet(viewsets.ModelViewSet):
 queryset=BuildProject.objects.all();serializer_class=ser(BuildProject);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('get',))
 def readiness(self,request,pk=None):return Response(BuilderService.readiness(self.get_object()))
class DynamicFormViewSet(viewsets.ModelViewSet):queryset=DynamicForm.objects.all();serializer_class=ser(DynamicForm);permission_classes=(IsAuthenticated,)
class FormSubmissionViewSet(viewsets.ModelViewSet):
 queryset=FormSubmission.objects.all();serializer_class=ser(FormSubmission);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('post',))
 def submit(self,request,pk=None):obj=FormService.submit(self.get_object());return Response(self.get_serializer(obj).data)
class PackageViewSet(viewsets.ReadOnlyModelViewSet):
 queryset=WorkflowPackage.objects.filter(status__in=('published','approved'));serializer_class=ser(WorkflowPackage);permission_classes=(IsAuthenticated,)
class SimulationViewSet(viewsets.ModelViewSet):
 queryset=SimulationScenario.objects.all();serializer_class=ser(SimulationScenario);permission_classes=(IsAuthenticated,)
 @action(detail=True,methods=('post',))
 def run(self,request,pk=None):scenario=self.get_object();results=DigitalTwinSimulator.run(scenario,request.data.get('seed',1));run=SimulationRun.objects.create(scenario=scenario,status='completed',seed=request.data.get('seed',1),results=results);return Response({'run_id':run.pk,'results':results})
