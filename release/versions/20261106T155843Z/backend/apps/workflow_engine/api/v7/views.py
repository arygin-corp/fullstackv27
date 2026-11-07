from rest_framework import serializers,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ...certification.models import CertificationReview,Publisher
from ...durable_runtime.models import ExecutionCheckpoint
from ...sre.models import ServiceCatalogEntry,ErrorBudgetSnapshot
from ...aiops.models import DetectedAnomaly
from ...chaos.models import ChaosExperiment
from ...self_healing.models import HealingPolicy
from ...multi_region.models import Region
class AutoSerializer(serializers.ModelSerializer):
 class Meta:fields='__all__'
def ser(model):return type(model.__name__+'Serializer',(AutoSerializer,),{'Meta':type('Meta',(),{'model':model,'fields':'__all__'})})
class CertificationViewSet(viewsets.ModelViewSet):queryset=CertificationReview.objects.all();serializer_class=ser(CertificationReview);permission_classes=(IsAuthenticated,)
class SREViewSet(viewsets.ReadOnlyModelViewSet):queryset=ServiceCatalogEntry.objects.all();serializer_class=ser(ServiceCatalogEntry);permission_classes=(IsAuthenticated,)
class AnomalyViewSet(viewsets.ReadOnlyModelViewSet):queryset=DetectedAnomaly.objects.order_by('-created_at');serializer_class=ser(DetectedAnomaly);permission_classes=(IsAuthenticated,)
class ChaosViewSet(viewsets.ReadOnlyModelViewSet):queryset=ChaosExperiment.objects.filter(enabled=True);serializer_class=ser(ChaosExperiment);permission_classes=(IsAuthenticated,)
class HealingViewSet(viewsets.ReadOnlyModelViewSet):queryset=HealingPolicy.objects.filter(enabled=True);serializer_class=ser(HealingPolicy);permission_classes=(IsAuthenticated,)
class RegionViewSet(viewsets.ReadOnlyModelViewSet):queryset=Region.objects.filter(active=True);serializer_class=ser(Region);permission_classes=(IsAuthenticated,)
