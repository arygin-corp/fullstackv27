from rest_framework.routers import DefaultRouter
from .views import BuildProjectViewSet,DynamicFormViewSet,FormSubmissionViewSet,PackageViewSet,SimulationViewSet
router=DefaultRouter();router.register('build-projects',BuildProjectViewSet);router.register('forms',DynamicFormViewSet);router.register('submissions',FormSubmissionViewSet);router.register('marketplace',PackageViewSet);router.register('simulations',SimulationViewSet);urlpatterns=router.urls
