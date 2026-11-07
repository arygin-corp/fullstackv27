# from django.urls import path
# from .views import access_workspace, agent_workspace, analytics_export, analytics_workspace, graph_workspace, governance_workspace, lineage_workspace, timeline_workspace, vikki_workspace, marketplace_workspace, marketplace_product_detail, delete_conversation, delete_document, delete_memory, document_detail, index, memory_settings, upload_document
# urlpatterns = [
#     path("", index, name="home"),
#     path("agent/", access_workspace, agent_workspace, analytics_export, analytics_workspace, graph_workspace, governance_workspace, lineage_workspace, timeline_workspace, vikki_workspace, marketplace_workspace, marketplace_product_detail, name="agent-workspace"),
#     path("memory/", memory_settings, name="memory-settings"),
#     path("memory/<int:memory_id>/delete/", delete_memory, name="delete-memory"),
#     path("conversations/<int:conversation_id>/", index, name="conversation-detail-page"),
#     path("conversations/<int:conversation_id>/delete/", delete_conversation, name="delete-conversation"),
#     path("documents/upload/", upload_document, name="upload-document"),
#     path("documents/<int:document_id>/", document_detail, name="document-detail"),
#     path("documents/<int:document_id>/delete/", delete_document, name="delete-document"),
# ]


from django.urls import path

from .views import (
    access_workspace,
    agent_workspace,
    analytics_export,
    analytics_workspace,
    graph_workspace,
    governance_workspace,
    lineage_workspace,
    timeline_workspace,
    vikki_workspace,
    marketplace_workspace,
    marketplace_product_detail,
)

urlpatterns = [
    path("access/", access_workspace, name="access-workspace"),
    path("agent/", agent_workspace, name="agent-workspace"),
    path("analytics/export/", analytics_export, name="analytics-export"),
    path("analytics/", analytics_workspace, name="analytics-workspace"),
    path("graph/", graph_workspace, name="graph-workspace"),
    path("governance/", governance_workspace, name="governance-workspace"),
    path("lineage/", lineage_workspace, name="lineage-workspace"),
    path("timeline/", timeline_workspace, name="timeline-workspace"),
    path("vikki/", vikki_workspace, name="vikki-workspace"),
    path("marketplace/", marketplace_workspace, name="marketplace-workspace"),
    path(
        "marketplace/<int:product_id>/",
        marketplace_product_detail,
        name="marketplace-product-detail",
    ),
]