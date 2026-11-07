from django.urls import path
from .views import AccessCartView, AccessDraftRequestsView, AccessReadinessView, AccessRequestSubmitView, AgentRunDetailView, AgentRunView, ChatView, ConversationDetailView, ConversationListView, DocumentSearchView, EntitySearchView, MemoryDeleteView, MemoryListCreateView, GraphView, GovernanceAssessView, GovernancePoliciesView, GovernanceStewardSearchView, LineageAssetsView, LineageGraphView, LineageImpactView, LineageScenarioView, MarketplaceAnalyticsView, MarketplaceCompareView, MarketplaceFavoriteView, MarketplaceSearchGapsView, MarketplaceRecommendView, MarketplaceSearchView, TimelineView, VikkiChatView, VikkiContextView, VikkiFeedbackView, StreamingChatView

# from .views import (ChatContextView, ChatFeedbackView, ChatMessageView,)
app_name = "chat"

urlpatterns = [
    # path("", ChatMessageView.as_view(), name="message"),
    # path("context/", ChatContextView.as_view(), name="context"),
    # path("feedback/", ChatFeedbackView.as_view(), name="feedback"),
    path("stream/", StreamingChatView.as_view(), name="api-chat-stream"),
    path("conversations/", ConversationListView.as_view(), name="api-conversations"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="api-conversation-detail"),
    path("entities/", EntitySearchView.as_view(), name="api-entities"),
    path("documents/search/", DocumentSearchView.as_view(), name="api-document-search"),
    path("memories/", MemoryListCreateView.as_view(), name="api-memories"),
    path("memories/<int:memory_id>/", MemoryDeleteView.as_view(), name="api-memory-delete"),
    path("agent/run/", AgentRunView.as_view(), name="api-agent-run"),
    path("agent/runs/<int:run_id>/", AgentRunDetailView.as_view(), name="api-agent-run-detail"),
    path("graph/", GraphView.as_view(), name="api-graph"),
    path("timeline/", TimelineView.as_view(), name="api-timeline"),
    path("marketplace/products/", MarketplaceSearchView.as_view(), name="api-marketplace-products"),
    path("marketplace/recommend/", MarketplaceRecommendView.as_view(), name="api-marketplace-recommend"),
    path("marketplace/compare/", MarketplaceCompareView.as_view(), name="api-marketplace-compare"),
    path("governance/assess/", GovernanceAssessView.as_view(), name="api-governance-assess"),
    path("governance/stewards/", GovernanceStewardSearchView.as_view(), name="api-governance-stewards"),
    path("governance/policies/", GovernancePoliciesView.as_view(), name="api-governance-policies"),
    path("access/readiness/", AccessReadinessView.as_view(), name="api-access-readiness"),
    path("access/cart/", AccessCartView.as_view(), name="api-access-cart"),
    path("access/requests/draft/", AccessDraftRequestsView.as_view(), name="api-access-drafts"),
    path("access/requests/<int:request_id>/submit/", AccessRequestSubmitView.as_view(), name="api-access-submit"),
    path("", VikkiChatView.as_view(), name="api-vikki-chat"),
    path("context/", VikkiContextView.as_view(), name="api-vikki-context"),
    path("feedback/", VikkiFeedbackView.as_view(), name="api-vikki-feedback"),
    path("marketplace/products/<int:product_id>/favorite/", MarketplaceFavoriteView.as_view(), name="api-marketplace-favorite"),
    path("marketplace/analytics/", MarketplaceAnalyticsView.as_view(), name="api-marketplace-analytics"),
    path("marketplace/analytics/search-gaps/", MarketplaceSearchGapsView.as_view(), name="api-marketplace-search-gaps"),
    path("lineage/assets/", LineageAssetsView.as_view(), name="api-lineage-assets"),
    path("lineage/assets/<int:asset_id>/graph/", LineageGraphView.as_view(), name="api-lineage-graph"),
    path("lineage/assets/<int:asset_id>/impact/", LineageImpactView.as_view(), name="api-lineage-impact"),
    path("lineage/scenarios/", LineageScenarioView.as_view(), name="api-lineage-scenarios"),
]
