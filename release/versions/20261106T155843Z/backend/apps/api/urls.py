from django.urls import path
from .views import StatusView, ResourceListView, DomainListView, ProductListView

urlpatterns = [
    path('status/', StatusView.as_view(), name='status'),
    path('resources/', ResourceListView.as_view(), name='resources'),
    path('marketplace/domains/', DomainListView.as_view(), name='domains'),
    path('marketplace/products/', ProductListView.as_view(), name='products'),
]
