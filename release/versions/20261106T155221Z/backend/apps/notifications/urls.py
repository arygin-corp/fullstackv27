from django.urls import path, include

from . import views, notification_views

app_name = "notifications"

urlpatterns = [
    # Notification Inbox
    path("", views.notification_list, name="list"),
    path("stream/", views.sse_notifications, name="stream"),
    path("unread/", views.unread_notifications, name="unread"),
    path("mark-all-read/", views.mark_all_read, name="mark_all_read"),
    path("<int:notification_id>/toggle-read/", views.toggle_read, name="toggle_read", ),
    path("preferences/", views.preferences, name="preferences", ),
    path("campaigns/", views.campaign_manager, name="campaign_manager", ),
    path("rules/", views.rules, name="rules", ),
    path("teams/", views.teams_destination, name="teams_destination", ),

    path("templates/", views.template_manager, name="template_manager", ),
    path("templates/<int:pk>/",views.template_detail, name="template_detail",),
    path("templates/create/", views.template_create, name="template_create",),

    path("summaries/", views.summaries, name="summaries", ),
    path("push-devices/", views.push_devices, name="push_devices", ),
    path("audiences/", views.audiences, name="audience_manager", ),
    path("fatigue-bundles/", views.fatigue_bundles, name="fatigue_bundles", ),
    path("deliveries/", views.deliveries, name="deliveries", ),
    path("operations/", views.admin_operations, name="admin_operations", ),
    path("dead-letters/", views.dead_letters, name="dead_letters", ),
    path("audit-ledger/", views.audit_ledger, name="audit_ledger", ),
    path("audiences/", notification_views.audiences, name="audiences"),
    path("audiences/new/", notification_views.audiences, name="audience_create"),
    path("audiences/<int:pk>/", notification_views.audience_detail, name="audience_detail"),
    path("rules/", notification_views.rules, name="rules"),
    path("rules/<int:pk>/edit/", notification_views.rule_edit, name="rule_edit"),
    path("rules/<int:pk>/delete/", notification_views.rule_delete, name="rule_delete"),
    path("deliveries/", notification_views.deliveries, name="deliveries"),
    path("deliveries/<int:pk>/", notification_views.delivery_detail, name="delivery_detail"),
    path("operations/", notification_views.admin_operations, name="admin_operations"),
    path("operations/dead-letters/", notification_views.dead_letters, name="dead_letters"),
    path("operations/dead-letters/<int:pk>/requeue/", notification_views.dead_letter_requeue, name="dead_letter_requeue",),
    path("operations/audit-ledger/", notification_views.audit_ledger, name="audit_ledger"),

    path("master/bulk/", views.bulk_action,name="master_bulk_action"),
    path("master/saved-view/", views.save_current_view,name="master_save_view"),
    path("master/correlation/", views.correlation_explorer,name="master_correlation"),
    path("master/object/<str:object_type>/<str:object_id>/", views.object_timeline,name="master_object_timeline"),
    path("master/advanced-analytics/", views.advanced_analytics,name="master_advanced_analytics"),
    path("master/explain/<int:pk>/", views.explain,name="master_explain"),
    path("master/recommendations/<int:pk>/feedback/", views.recommendation_feedback,name="master_recommendation_feedback"),
    path("master/insights/generate/", views.generate_communication_insights,name="master_generate_insights"),
    path("", include("apps.notifications.api_v1.urls")),
    path("", include("apps.notifications.api_v1.urls")),
    path("api/master/", include("apps.notifications.api_v1.urls")),
]