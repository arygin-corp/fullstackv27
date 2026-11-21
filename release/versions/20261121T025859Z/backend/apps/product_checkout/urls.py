from django.urls import path

from .views import (
    CheckoutContextView,
    CheckoutCreateView,
    CheckoutDetailView,
    CheckoutEvaluateView,
    MyCheckoutListView,
)

app_name = "product_checkout"

urlpatterns = [
    path(
        "products/<str:product_ref>/context/",
        CheckoutContextView.as_view(),
        name="context",
    ),
    path(
        "products/<str:product_ref>/evaluate/",
        CheckoutEvaluateView.as_view(),
        name="evaluate",
    ),
    path("requests/", CheckoutCreateView.as_view(), name="create"),
    path("requests/mine/", MyCheckoutListView.as_view(), name="mine"),
    path(
        "requests/<uuid:id>/",
        CheckoutDetailView.as_view(),
        name="detail",
    ),
]
