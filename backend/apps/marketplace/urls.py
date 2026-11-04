from django.urls import include, path
from rest_framework import routers
from .api_views import ProductJsonViewSet, DomainJsonViewSet, HybridProductSearchViewSet, SearchSuggestionsViewSet

app_name = "marketplace"

router = routers.DefaultRouter()

router.register(r'products', ProductJsonViewSet, basename='api-products')
router.register(r'domains', DomainJsonViewSet, basename='api-domains')
router.register(r"search", HybridProductSearchViewSet, basename="product-search",)
router.register(r"search/suggestions", SearchSuggestionsViewSet, basename="search-suggestions",)

product_list = ProductJsonViewSet.as_view({"get": "list",})
product_detail = ProductJsonViewSet.as_view({"get": "retrieve",})

urlpatterns = [
    path('api/', include(router.urls)),
    path("api/products/<str:pk>/", product_detail, name="api-products-detail",),
]





