from django.urls import include, path
from rest_framework import routers
from .api_views import ProductJsonViewSet, DomainJsonViewSet, HybridProductSearchViewSet, SearchSuggestionsViewSet
from .resource_api import resource_routes

app_name = "marketplace"

router = routers.DefaultRouter()

router.register(r'products', ProductJsonViewSet, basename='api-products')
router.register(r'domains', DomainJsonViewSet, basename='api-domains')
router.register(r"search", HybridProductSearchViewSet, basename="product-search",)
router.register(r"search/suggestions", SearchSuggestionsViewSet, basename="search-suggestions",)
for route, basename, viewset in resource_routes():
    router.register(route, viewset, basename=basename)

product_list = ProductJsonViewSet.as_view({"get": "list",})
product_detail = ProductJsonViewSet.as_view({"get": "retrieve",})

urlpatterns = [
    path('api/', include(router.urls)),
    path("api/products/<str:pk>/", product_detail, name="api-products-detail",),
]





