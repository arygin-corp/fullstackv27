from rest_framework.routers import DefaultRouter
from .views import CertificationViewSet,SREViewSet,AnomalyViewSet,ChaosViewSet,HealingViewSet,RegionViewSet
router=DefaultRouter();router.register('certifications',CertificationViewSet);router.register('services',SREViewSet);router.register('anomalies',AnomalyViewSet);router.register('chaos',ChaosViewSet);router.register('healing',HealingViewSet);router.register('regions',RegionViewSet);urlpatterns=router.urls
