from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, ProductIntakeViewSet, ProtectedMembershipView, SecurityEventViewSet

app_name="intake"
router=DefaultRouter()

router.register("requests",ProductIntakeViewSet,basename="intake")
router.register("notifications",NotificationViewSet,basename="intake-notifications")
router.register("security-events",SecurityEventViewSet,basename="intake-security-events")
urlpatterns=[path("api/v1/protected-memberships/",ProtectedMembershipView.as_view(),name="protected-memberships"),path("api/v1/",include(router.urls))]
