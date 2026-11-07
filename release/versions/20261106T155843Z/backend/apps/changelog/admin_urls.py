from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework import routers
from . import views
from .audit_views import AuditLogDetailView, AuditLogExportView, AuditLogListView
from .public_api import (PublicApiIndex, PublicLatestReleaseApi, PublicReleaseDetailApi, PublicReleaseHtmlView, PublicReleaseListApi,)

app_name = "changelog"
router = routers.DefaultRouter()
router.register("categories", views.CategorieViewSet, basename="category")
router.register("posts", views.PostViewSet, basename="post")

urlpatterns = [
    path("audit/", AuditLogListView.as_view(), name="audit-list"),
    path("audit/export.csv", AuditLogExportView.as_view(), name="audit-export"),
    path("audit/<int:pk>/", AuditLogDetailView.as_view(), name="audit-detail"),
    path("timeline/", views.PublicTimelineView.as_view(), name="public-timeline"),
    path("timeline/fragment/", views.PublicTimelineFragmentView.as_view(), name="public-timeline-fragment"),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("posts/", views.PostListView.as_view(), name="post-list"),
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("compare/", views.ReleaseCompareView.as_view(), name="post-compare"),
    path("posts/create/", views.PostCreateView.as_view(), name="post-create"),
    path("posts/<int:pk>/", views.PostDetailView.as_view(), name="post-detail"),
    path("posts/<int:pk>/update/", views.PostUpdateView.as_view(), name="post-update"),
    path("posts/<int:pk>/delete/", views.PostDeleteView.as_view(), name="post-delete"),
    path("posts/<int:pk>/submit/", views.SubmitReleaseView.as_view(), name="post-submit"),
    path("posts/<int:pk>/approve/", views.ApproveReleaseView.as_view(), name="post-approve"),
    path("posts/<int:pk>/publish/", views.PublishReleaseView.as_view(), name="post-publish"),
    path("posts/<int:pk>/archive/", views.ArchiveReleaseView.as_view(), name="post-archive"),
    path("notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", views.NotificationReadView.as_view(), name="notification-read"),
    path("notifications/preferences/", views.SubscriptionToggleView.as_view(), name="notification-preferences"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("categories/create/", views.CategoryCreateView.as_view(), name="category-create"),
    path("categories/<int:pk>/", views.CategoryDetailView.as_view(), name="category-detail"),
    path("categories/<int:pk>/update/", views.CategoryUpdateView.as_view(), name="category-update"),
    path("categories/<int:pk>/delete/", views.CategoryDeleteView.as_view(), name="category-delete"),
    path("releases/", views.ChangelogTimelineApi.as_view(), name="api-releases",),
    path("timeline/", views.ChangelogTimelineApi.as_view(), name="changelog-timeline",),

    #APIs
    path("public/api/", PublicApiIndex.as_view(), name="public-api-index"),
    path("public/api/help/", TemplateView.as_view(template_name="changelog/public/api_help.html"), name="public-api-help"),
    path("public/api/releases/", PublicReleaseListApi.as_view(), name="public-api-releases"),
    path("public/api/releases/latest/", PublicLatestReleaseApi.as_view(), name="public-api-latest"),
    path("public/api/releases/<str:version>/", PublicReleaseDetailApi.as_view(), name="public-api-release-detail"),
    path("public/html/releases/<str:version>/", PublicReleaseHtmlView.as_view(), name="public-html-release"),
]
