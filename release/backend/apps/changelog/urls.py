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
    path("public/", PublicApiIndex.as_view(), name="public-api-index"),
    path("public/help/", TemplateView.as_view(template_name="changelog/public/api_help.html"), name="public-api-help"),
    path("public/releases/", PublicReleaseListApi.as_view(), name="public-api-releases"),
    path("public/releases/latest/", PublicLatestReleaseApi.as_view(), name="public-api-latest"),
    path("public/releases/<str:version>/", PublicReleaseDetailApi.as_view(), name="public-api-release-detail"),
    path("public/html/releases/<str:version>/", PublicReleaseHtmlView.as_view(), name="public-html-release"),
    path("timeline/", views.PublicTimelineView.as_view(), name="public-timeline"),
    path("timeline/fragment/", views.PublicTimelineFragmentView.as_view(), name="public-timeline-fragment"),
    path("api/", include(router.urls)),
    path("admin/api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("admin/posts/", views.PostListView.as_view(), name="post-list"),
    path("admin/dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("admin/compare/", views.ReleaseCompareView.as_view(), name="post-compare"),
    path("admin/posts/create/", views.PostCreateView.as_view(), name="post-create"),
    path("admin/posts/<int:pk>/", views.PostDetailView.as_view(), name="post-detail"),
    path("admin/posts/<int:pk>/update/", views.PostUpdateView.as_view(), name="post-update"),
    path("admin/posts/<int:pk>/delete/", views.PostDeleteView.as_view(), name="post-delete"),
    path("admin/posts/<int:pk>/submit/", views.SubmitReleaseView.as_view(), name="post-submit"),
    path("admin/posts/<int:pk>/approve/", views.ApproveReleaseView.as_view(), name="post-approve"),
    path("admin/posts/<int:pk>/publish/", views.PublishReleaseView.as_view(), name="post-publish"),
    path("admin/posts/<int:pk>/archive/", views.ArchiveReleaseView.as_view(), name="post-archive"),
    path("admin/notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("admin/notifications/<int:pk>/read/", views.NotificationReadView.as_view(), name="notification-read"),
    path("admin/notifications/preferences/", views.SubscriptionToggleView.as_view(), name="notification-preferences"),
    path("admin/categories/", views.CategoryListView.as_view(), name="category-list"),
    path("admin/categories/create/", views.CategoryCreateView.as_view(), name="category-create"),
    path("admin/categories/<int:pk>/", views.CategoryDetailView.as_view(), name="category-detail"),
    path("admin/categories/<int:pk>/update/", views.CategoryUpdateView.as_view(), name="category-update"),
    path("admin/categories/<int:pk>/delete/", views.CategoryDeleteView.as_view(), name="category-delete"),
    # path("api/changelog/catgeories", views.CategorieViewSet.as_view({"get":"list", "post":"create"}), name="legacy-category-list"),
    # path("api/changelog/category/<int:pk>", views.CategorieViewSet.as_view({"get":"retrieve", "put":"update", "delete":"destroy"}), name="legacy-category-detail"),
    # path("api/changelog/category/published", views.CategorieViewSet.as_view({"get":"published"}), name="legacy-category-published"),
    # path("api/changelog/posts", views.PostViewSet.as_view({"get":"list", "post":"create"}), name="legacy-post-list"),
    # path("api/changelog/post/<int:pk>", views.PostViewSet.as_view({"get":"retrieve", "put":"update", "delete":"destroy"}), name="legacy-post-detail"),
    # path("api/changelog/post/published", views.PostViewSet.as_view({"get":"published"}), name="legacy-post-published"),
    path("admin/releases/", views.ChangelogTimelineApi.as_view(), name="api-releases",),
    path("admin/timeline/", views.ChangelogTimelineApi.as_view(), name="changelog-timeline",),
]
