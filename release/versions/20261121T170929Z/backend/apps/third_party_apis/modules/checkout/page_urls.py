from django.urls import path

from .builder_views import checkout_form_builder, checkout_form_builder_document

app_name = "checkout_pages"

urlpatterns = [
    path("form-builder/", checkout_form_builder, name="checkout_form_builder"),
    path("form-builder/document/", checkout_form_builder_document, name="checkout_form_builder_document"),
]
