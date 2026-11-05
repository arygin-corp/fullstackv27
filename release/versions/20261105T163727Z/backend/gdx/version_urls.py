from django.urls import path
from .version_views import version_view
urlpatterns = [path("version/", version_view, name="version")]
