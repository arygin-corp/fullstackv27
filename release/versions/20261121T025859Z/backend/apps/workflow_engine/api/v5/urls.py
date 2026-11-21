from rest_framework.routers import DefaultRouter
from .views import FlowViewSet,ConnectorViewSet,OperationsViewSet,TelemetryViewSet,IncidentViewSet
router=DefaultRouter();router.register('flows',FlowViewSet);router.register('connectors',ConnectorViewSet);router.register('operations',OperationsViewSet);router.register('telemetry',TelemetryViewSet);router.register('incidents',IncidentViewSet);urlpatterns=router.urls
