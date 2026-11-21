from django.contrib import admin
from django.urls import path
from .template_views import AuditListView, OrderDetailView, OrderListView, OrdersAnalyticsView, OrdersDashboardView, SyncHealthView, TrackOrderPageView
from .views import ProfileActivityView, RecentOrdersView, TrackOrderView

app_name = "orders-admin"

urlpatterns = [
    path('track-order/', TrackOrderView.as_view(), name='track-order-api'),
    path('activity/', ProfileActivityView.as_view(), name='profile-activity'),
    path('recent/', RecentOrdersView.as_view(), name='recent-orders'),
    path('dashboard',OrdersDashboardView.as_view(),name='dashboard'),
    path('orders/',OrderListView.as_view(),name='order-list'),
    path('orders/<str:request_id>/',OrderDetailView.as_view(),name='order-detail'),
    path('analytics/',OrdersAnalyticsView.as_view(),name='analytics'),
    path('track/',TrackOrderPageView.as_view(),name='track-order'),
    path('audit/',AuditListView.as_view(),name='audit-list'),
    path('sync-health/',SyncHealthView.as_view(),name='sync-health'),
]
