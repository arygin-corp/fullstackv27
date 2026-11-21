from rest_framework.test import APIRequestFactory

from apps.marketplace.api_views import SearchViewSet
from apps.marketplace.serializers import SearchQuerySerializer
from .base import MarketplaceTestCase


class SearchValidationTests(MarketplaceTestCase):
    def test_search_query_serializer_rejects_invalid_bounds(self):
        serializer = SearchQuerySerializer(data={"query": "x", "page": 0, "limit": 51})
        self.assertFalse(serializer.is_valid())
        self.assertIn("page", serializer.errors)
        self.assertIn("limit", serializer.errors)

    def test_search_endpoint_returns_400_for_non_numeric_page(self):
        request = APIRequestFactory().get("/api/search/suggestions/", {
            "query": "customer",
            "page": "not-a-number",
        })
        response = SearchViewSet.as_view({"get": "suggestions"})(request)
        self.assertEqual(response.status_code, 400)

    def test_search_endpoint_rejects_excessive_limit(self):
        request = APIRequestFactory().get("/api/search/suggestions/", {
            "query": "customer",
            "limit": 5000,
        })
        response = SearchViewSet.as_view({"get": "suggestions"})(request)
        self.assertEqual(response.status_code, 400)
