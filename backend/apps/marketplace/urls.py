from django.urls import include, path
from rest_framework import routers
from .api_views import ProductJsonViewSet, DomainJsonViewSet, HybridProductSearchViewSet, SearchSuggestionsViewSet
from .review_api import MyProductReviewView, ProductReviewListView
from .resource_api import resource_routes
from .page_views import MarketplaceHomeView

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
    path("", MarketplaceHomeView.as_view(), name="home"),
    path("api/products/<str:pk>/reviews/me/", MyProductReviewView.as_view(), name="api-product-review-me"),
    path("api/products/<str:pk>/reviews/", ProductReviewListView.as_view(), name="api-product-reviews"),
    path('api/', include(router.urls)),
    path("api/products/<str:pk>/", product_detail, name="api-products-detail",),
]





