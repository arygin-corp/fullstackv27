from django.urls import path

from apps.profiles.api import MarketplaceProfileView

urlpatterns = [
    path("me/", MarketplaceProfileView.as_view(), name="marketplace-profile"),
]
