from rest_framework.routers import DefaultRouter
from .views import *
router=DefaultRouter();router.register("tenants",TenantViewSet);router.register("policies",PolicyViewSet);router.register("exceptions",ExceptionViewSet);router.register("risks",RiskViewSet);router.register("platform-definitions",PlatformDefinitionViewSet);urlpatterns=router.urls
