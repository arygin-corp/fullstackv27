from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import NotificationViewSet, ProductIntakeViewSet, ProtectedMembershipView, SecurityEventViewSet

app_name = "intake"

router = SimpleRouter()
router.register("notifications", NotificationViewSet, basename="intake-notifications")
router.register("security-events", SecurityEventViewSet, basename="intake-security-events")
router.register("", ProductIntakeViewSet, basename="intake")

urlpatterns = [
    path("protected-memberships/", ProtectedMembershipView.as_view(), name="protected-memberships"),
    path("", include(router.urls)),
]
