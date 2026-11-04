from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.apify.platform import views

app_name = "apify_api"

router = DefaultRouter()

for name in views.NAMES:
    router.register(
        name.replace("_", "-").lower(),
        getattr(views, f"{name}ViewSet"),
        basename=name.lower(),
    )

urlpatterns = router.urls