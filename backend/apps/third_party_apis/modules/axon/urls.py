from django.urls import path

from . import views

urlpatterns = [
    path("get-token", views.get_token, name="axon-get-token"),
    path("axon-facet-search", views.axon_facet_search, name="axon-facet-search"),
    path("axon-glossary", views.axon_glossary, name="axon-glossary"),
]
