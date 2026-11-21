from rest_framework.routers import DefaultRouter
from .views import SecureInstanceViewSet
router=DefaultRouter();router.register("instances",SecureInstanceViewSet,basename="secure-workflow-instance");urlpatterns=router.urls
