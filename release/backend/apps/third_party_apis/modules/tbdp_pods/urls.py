from django.urls import path

from .views import PodDropdownView

app_name = "tbdp_pods"

urlpatterns = [
    path("dropdown/", PodDropdownView.as_view(), name="dropdown"),
]
