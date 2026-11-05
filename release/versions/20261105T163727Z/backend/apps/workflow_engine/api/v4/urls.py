from rest_framework.routers import DefaultRouter
from .views import OfferingViewSet,InboxViewSet,OperationsViewSet,ReplayViewSet
router=DefaultRouter();router.register('offerings',OfferingViewSet);router.register('inbox',InboxViewSet,basename='work-inbox');router.register('operations',OperationsViewSet);router.register('replay',ReplayViewSet);urlpatterns=router.urls
