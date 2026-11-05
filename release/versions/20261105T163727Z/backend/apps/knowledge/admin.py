from django.contrib import admin
from .models import *
models_to_register=[Document,DocumentChunk,DocumentEntity,Entity,EntityRelation,TimelineEvent,MarketplaceDomain,MarketplaceDataType,MarketplaceTeam,MarketplaceProductSimilarity,GovernancePolicy,GovernanceRule,GovernanceSteward,ProductGovernanceAssignment,ProductStewardAssignment,GovernanceAssessment,AccessRequirement,ApprovalRoute,ApprovalRouteStep,AccessProfile,AccessCart,AccessCartItem,AccessRequest,AccessRequestApproval,MarketplaceFavorite,MarketplaceActivity,VikkiSession,VikkiSuggestion,MarketplaceSearchEvent,MarketplaceDailyMetric,MarketplaceAnalyticsSnapshot,LineageAsset,LineageEdge,LineageChangeScenario,LineageNotificationTarget,VikkiFeedback]
for model in models_to_register:
    try:admin.site.register(model)
    except admin.sites.AlreadyRegistered:pass
@admin.register(MarketplaceProduct)
class MarketplaceProductAdmin(admin.ModelAdmin):
    list_display=("name","domain","data_type","status","active","owner")
    list_filter=("status","active","contains_pi","contains_sensitive_pi","data_review_required")
    search_fields=("name","sku","external_id","brief_description","ai_summary")
