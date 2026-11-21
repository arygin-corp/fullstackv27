from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .api import PageViewSet, page_by_slug
from .public_api import public_page_by_slug

router = DefaultRouter()
router.register(r"pages", PageViewSet, basename="master-page",)


urlpatterns = [
    path("by-slug/<slug:slug>/", page_by_slug, name="page-by-slug",),
    path("public/by-slug/<slug:slug>/", public_page_by_slug, name="public-page-by-slug",),
    path( "", include(router.urls),),
]