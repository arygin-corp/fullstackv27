from django.urls import path

from . import views

urlpatterns = [
    path("", views.find_all, name="onets-order-history-list"),
    path("findAndSave", views.find_and_save, name="onets-order-history-find"),
    path("findAndSave/", views.find_and_save),
    path("event", views.update_event, name="onets-orders-event"),
    path("event/", views.update_event),
    path("save", views.save_request, name="onets-order-history-save"),
    path("save/", views.save_request),
    path("product", views.load_products, name="onets-order-history-product"),
    path("product/", views.load_products),
    path("checkout", views.submit_order, name="onets-order-checkout"),
    path("checkout/", views.submit_order),
    path("upload", views.upload_attachment, name="onets-order-upload"),
    path("upload/", views.upload_attachment),
]
