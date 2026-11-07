from django.urls import path
from . import views

app_name="notifications_api_v1"

urlpatterns=[
    path("notifications/", views.list_notifications,name="list"),
    path("notifications/<int:notification_id>/open/", views.open_notification,name="open"),
    path("notifications/<int:notification_id>/click/", views.click_notification,name="click"),
    path("notifications/<int:notification_id>/dismiss/", views.dismiss_notification,name="dismiss"),
    path("analytics/", views.analytics,name="analytics"),
    path("search/", views.search,name="master_api_search")
]
