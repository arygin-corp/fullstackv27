from django.urls import path
from .views import CartItemRequestFormView, CheckoutDetailView, CheckoutSubmitView, CurrentCartView, ProductRequestFormView
app_name="data_marketplace_checkout_api"
urlpatterns=[
 path("product/cart/",CurrentCartView.as_view(),name="current_cart"),
 path("product/products/<int:product_id>/request-form/",ProductRequestFormView.as_view(),name="product_request_form"),
 path("product/cart/items/<uuid:line_key>/request-form/",CartItemRequestFormView.as_view(),name="cart_item_request_form"),
 path("cart/checkout/",CheckoutSubmitView.as_view(),name="checkout"),
 path("product/checkouts/<uuid:checkout_id>/",CheckoutDetailView.as_view(),name="checkout_detail"),
]
