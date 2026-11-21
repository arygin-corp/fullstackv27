from rest_framework.routers import DefaultRouter
from .views import AgentStoreViewSet,CitizenStudioViewSet,FabricViewSet,DiscoveryViewSet,GovernanceSignalViewSet,DecisionViewSet
router=DefaultRouter();router.register('agent-store',AgentStoreViewSet);router.register('citizen-studio',CitizenStudioViewSet);router.register('knowledge-fabric',FabricViewSet);router.register('process-discovery',DiscoveryViewSet);router.register('governance-signals',GovernanceSignalViewSet);router.register('decisions',DecisionViewSet);urlpatterns=router.urls
