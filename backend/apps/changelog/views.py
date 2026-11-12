from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse, reverse_lazy
from django.views import View
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .analytics import dashboard_metrics
from .audit import log_event, serialize_instance
from .comparison import compare_posts
from .forms import CategorieForm, PostForm
from .models import AuditLog, Categorie, Notification, Post, ReleaseStatus, ReleaseSubscription
from .permissions import ViewDjangoModelPermissions
from .search import search_posts
from .serializers import ChangelogCategorySerializer, ChangelogPostSerializer
from .services import approve_release, archive_release, publish_release, submit_for_review
from .timeline import serialize_sections, timeline_payload
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.html import strip_tags
from django.views.generic import TemplateView
from .models import Post

class AuditUserMixin:
    def form_valid(self, form):
        if not form.instance.pk:
            form.instance.created_by = self.request.user
        form.instance.updated_by = self.request.user
        return super().form_valid(form)


class ReadAuditMixin:
    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        response = self.render_to_response(self.get_context_data(object=self.object))
        log_event(request=request, action=AuditLog.Action.READ, instance=self.object,
                  after=serialize_instance(self.object))
        return response


class PublicTimelineView(ListView):
    template_name = "changelog/public/timeline.html"
    context_object_name = "posts"
    paginate_by = 20

    def get_queryset(self):
        return Post.objects.filter(status=ReleaseStatus.PUBLISHED).select_related(
            *[f"type{x}" for x in "ABCDEFGHIJ"]
        ).order_by("-release_date", "-id")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        posts = list(context["posts"])
        context["releases"] = [
            {"post": post, "sections": serialize_sections(post), "has_next": index < len(posts) - 1}
            for index, post in enumerate(posts)
        ]
        return context


class PublicTimelineFragmentView(View):
    def get(self, request):
        page = int(
            request.GET.get(
                "page",
                1,
            )
        )

        page_size = int(
            request.GET.get(
                "page_size",
                20,
            )
        )

        start = (page - 1) * page_size
        end = start + page_size

        posts = list(
            Post.objects.filter(
                status=ReleaseStatus.PUBLISHED
            )
            .select_related(
                *[
                    f"type{x}"
                    for x in "ABCDEFGHIJ"
                ]
            )
            .order_by(
                "-release_date",
                "-id",
            )[start:end]
        )
        html = "".join(
            timeline_payload(post, include_html=True, has_next=index < len(posts) - 1)["html"]
            for index, post in enumerate(posts)
        )
        return HttpResponse(html, content_type="text/html; charset=utf-8")


class DashboardView(LoginRequiredMixin, PermissionRequiredMixin, TemplateView):
    permission_required = "changelog.view_post"
    raise_exception = True
    template_name = "changelog/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["metrics"] = dashboard_metrics()
        return context


class ReleaseCompareView(LoginRequiredMixin, PermissionRequiredMixin, TemplateView):
    permission_required = "changelog.view_post"
    raise_exception = True
    template_name = "changelog/posts/post_compare.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        posts = Post.objects.select_related(*[f"type{x}" for x in "ABCDEFGHIJ"])
        context["available_posts"] = posts.order_by("-release_date", "-id")
        before_id = self.request.GET.get("before")
        after_id = self.request.GET.get("after")
        if before_id and after_id:
            before = get_object_or_404(posts, pk=before_id)
            after = get_object_or_404(posts, pk=after_id)
            context["comparison"] = compare_posts(before, after)
        return context


class PostListView(LoginRequiredMixin, PermissionRequiredMixin, ListView):
    model = Post
    permission_required = "changelog.view_post"
    raise_exception = True
    template_name = "changelog/posts/post_list.html"
    context_object_name = "posts"
    paginate_by = 25

    def get_queryset(self):
        qs = Post.objects.select_related(
            *[f"type{x}" for x in "ABCDEFGHIJ"], "created_by", "updated_by"
        )
        return search_posts(qs, self.request.GET.get("q"))


class PostDetailView(LoginRequiredMixin, PermissionRequiredMixin, ReadAuditMixin, DetailView):
    model = Post
    permission_required = "changelog.view_post"
    raise_exception = True
    template_name = "changelog/posts/post_detail.html"
    context_object_name = "post"


class PostCreateView(LoginRequiredMixin, PermissionRequiredMixin, AuditUserMixin, CreateView):
    model = Post
    form_class = PostForm
    permission_required = "changelog.add_post"
    raise_exception = True
    template_name = "changelog/posts/post_form.html"
    success_url = reverse_lazy("changelog:post-list")


class PostUpdateView(LoginRequiredMixin, PermissionRequiredMixin, AuditUserMixin, UpdateView):
    model = Post
    form_class = PostForm
    permission_required = "changelog.change_post"
    raise_exception = True
    template_name = "changelog/posts/post_form.html"
    success_url = reverse_lazy("changelog:post-list")


class PostDeleteView(LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    model = Post
    permission_required = "changelog.delete_post"
    raise_exception = True
    template_name = "changelog/posts/post_confirm_delete.html"
    success_url = reverse_lazy("changelog:post-list")


class WorkflowActionView(LoginRequiredMixin, PermissionRequiredMixin, View):
    raise_exception = True
    permission_required = "changelog.change_post"
    action_name = None

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        try:
            if self.action_name == "submit":
                submit_for_review(post, request.user)
            elif self.action_name == "approve":
                if not request.user.has_perm("changelog.approve_post"):
                    return self.handle_no_permission()
                approve_release(post, request.user)
            elif self.action_name == "publish":
                if not request.user.has_perm("changelog.publish_post"):
                    return self.handle_no_permission()
                publish_release(post, request.user)
            elif self.action_name == "archive":
                if not request.user.has_perm("changelog.publish_post"):
                    return self.handle_no_permission()
                archive_release(post, request.user)
            messages.success(request, f"Release workflow updated: {post.get_status_display()}.")
        except ValidationError as exc:
            messages.error(request, "; ".join(exc.messages))
        namespace = getattr(request.resolver_match, "namespace", "")
        detail_name = "changelog_staff:post-detail" if namespace == "changelog_staff" else "changelog:post-detail"
        return redirect(detail_name, pk=post.pk)


class SubmitReleaseView(WorkflowActionView):
    action_name = "submit"


class ApproveReleaseView(WorkflowActionView):
    action_name = "approve"


class PublishReleaseView(WorkflowActionView):
    action_name = "publish"


class ArchiveReleaseView(WorkflowActionView):
    action_name = "archive"


class NotificationListView(LoginRequiredMixin, ListView):
    template_name = "changelog/notifications/notification_list.html"
    context_object_name = "notifications"
    paginate_by = 25

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).select_related("post")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        subscription, _ = ReleaseSubscription.objects.get_or_create(user=self.request.user)
        context["subscription"] = subscription
        return context


class NotificationReadView(LoginRequiredMixin, View):
    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.mark_read()
        return redirect("changelog:notification-list")


class SubscriptionToggleView(LoginRequiredMixin, View):
    def post(self, request):
        subscription, _ = ReleaseSubscription.objects.get_or_create(user=request.user)
        subscription.email_enabled = request.POST.get("email_enabled") == "on"
        subscription.in_app_enabled = request.POST.get("in_app_enabled") == "on"
        subscription.save()
        messages.success(request, "Notification preferences updated.")
        return redirect("changelog:notification-list")


class CategoryListView(LoginRequiredMixin, PermissionRequiredMixin, ListView):
    model = Categorie
    permission_required = "changelog.view_categorie"
    raise_exception = True
    template_name = "changelog/categories/category_list.html"
    context_object_name = "categories"
    paginate_by = 25


class CategoryDetailView(LoginRequiredMixin, PermissionRequiredMixin, ReadAuditMixin, DetailView):
    model = Categorie
    permission_required = "changelog.view_categorie"
    raise_exception = True
    template_name = "changelog/categories/category_detail.html"
    context_object_name = "category"


class CategoryCreateView(LoginRequiredMixin, PermissionRequiredMixin, AuditUserMixin, CreateView):
    model = Categorie
    form_class = CategorieForm
    permission_required = "changelog.add_categorie"
    raise_exception = True
    template_name = "changelog/categories/category_form.html"
    success_url = reverse_lazy("changelog:category-list")


class CategoryUpdateView(LoginRequiredMixin, PermissionRequiredMixin, AuditUserMixin, UpdateView):
    model = Categorie
    form_class = CategorieForm
    permission_required = "changelog.change_categorie"
    raise_exception = True
    template_name = "changelog/categories/category_form.html"
    success_url = reverse_lazy("changelog:category-list")


class CategoryDeleteView(LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    model = Categorie
    permission_required = "changelog.delete_categorie"
    raise_exception = True
    template_name = "changelog/categories/category_confirm_delete.html"
    success_url = reverse_lazy("changelog:category-list")

    def form_valid(self, form):
        try:
            with transaction.atomic():
                return super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, "This category is used by a release note and cannot be deleted.")
            return HttpResponseRedirect(reverse("changelog:category-detail", kwargs={"pk": self.object.pk}))


def _staff_changelog_page(context, heading):
    context["heading"] = heading
    context["heading2"] = heading
    context["pageview"] = "Changelog"
    return context


class StaffCategoryListView(CategoryListView):
    template_name = "gdx_users/apps/changelog/categories/index.html"

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Categories")


class StaffCategoryDetailView(CategoryDetailView):
    template_name = "gdx_users/apps/changelog/categories/detail.html"

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), self.object.name)


class StaffCategoryCreateView(CategoryCreateView):
    template_name = "gdx_users/apps/changelog/categories/form.html"
    success_url = reverse_lazy("changelog_staff:category-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Add Category")


class StaffCategoryUpdateView(CategoryUpdateView):
    template_name = "gdx_users/apps/changelog/categories/form.html"
    success_url = reverse_lazy("changelog_staff:category-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Edit Category")


class StaffCategoryDeleteView(CategoryDeleteView):
    template_name = "gdx_users/apps/changelog/categories/delete.html"
    success_url = reverse_lazy("changelog_staff:category-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Delete Category")

    def form_valid(self, form):
        try:
            with transaction.atomic():
                return DeleteView.form_valid(self, form)
        except ProtectedError:
            messages.error(self.request, "This category is used by a release note and cannot be deleted.")
            return HttpResponseRedirect(reverse("changelog_staff:category-detail", kwargs={"pk": self.object.pk}))


class StaffPostListView(PostListView):
    template_name = "gdx_users/apps/changelog/posts/index.html"

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Releases")


class StaffPostDetailView(PostDetailView):
    template_name = "gdx_users/apps/changelog/posts/detail.html"

    def get_context_data(self, **kwargs):
        context = _staff_changelog_page(super().get_context_data(**kwargs), self.object.version)
        context["sections"] = [
            {
                "subtitle": getattr(self.object, f"subTitle{letter}"),
                "category": getattr(self.object, f"type{letter}"),
                "body": getattr(self.object, f"post{letter}"),
            }
            for letter in "ABCDEFGHIJ"
        ]
        return context


class StaffPostCreateView(PostCreateView):
    template_name = "gdx_users/apps/changelog/posts/form.html"
    success_url = reverse_lazy("changelog_staff:post-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Add Release")


class StaffPostUpdateView(PostUpdateView):
    template_name = "gdx_users/apps/changelog/posts/form.html"
    success_url = reverse_lazy("changelog_staff:post-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Edit Release")


class StaffPostDeleteView(PostDeleteView):
    template_name = "gdx_users/apps/changelog/posts/delete.html"
    success_url = reverse_lazy("changelog_staff:post-list")

    def get_context_data(self, **kwargs):
        return _staff_changelog_page(super().get_context_data(**kwargs), "Delete Release")


class CategorieViewSet(viewsets.ModelViewSet):
    serializer_class = ChangelogCategorySerializer
    permission_classes = [permissions.IsAuthenticated, ViewDjangoModelPermissions]
    filterset_fields = ["name", "slug", "is_active"]
    search_fields = ["name", "slug", "desc"]
    ordering_fields = ["name", "published_date", "created_at", "updated_at"]
    ordering = ["name"]

    def get_queryset(self):
        qs = Categorie.objects.select_related("created_by", "updated_by")
        return qs.filter(is_active=True) if self.request.query_params.get("published") == "true" else qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="published")
    def published(self, request):
        queryset = self.filter_queryset(self.get_queryset().filter(is_active=True))
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = ChangelogPostSerializer
    permission_classes = [permissions.IsAuthenticated, ViewDjangoModelPermissions]
    filterset_fields = ["version", "title", "status", "is_active"]
    ordering_fields = ["version", "release_date", "publish_at", "published_at", "created_at", "updated_at"]
    ordering = ["-release_date", "-id"]

    def get_queryset(self):
        qs = Post.objects.select_related(
            *[f"type{x}" for x in "ABCDEFGHIJ"], "created_by", "updated_by",
            "submitted_by", "approved_by"
        )
        if self.request.query_params.get("published") == "true":
            qs = qs.filter(status=ReleaseStatus.PUBLISHED)
        return search_posts(qs, self.request.query_params.get("q"))

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def _workflow(self, request, obj, operation, permission=None):
        if permission and not request.user.has_perm(permission):
            self.permission_denied(request)
        try:
            operation(obj, request.user)
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_409_CONFLICT)
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        return self._workflow(request, self.get_object(), submit_for_review)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._workflow(request, self.get_object(), approve_release, "changelog.approve_post")

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        return self._workflow(request, self.get_object(), publish_release, "changelog.publish_post")

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        return self._workflow(request, self.get_object(), archive_release, "changelog.publish_post")

    @action(detail=False, methods=["get"], url_path="published")
    def published(self, request):
        queryset = self.filter_queryset(self.get_queryset().filter(status=ReleaseStatus.PUBLISHED))
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="timeline")
    def timeline(self, request):
        queryset = self.get_queryset().filter(status=ReleaseStatus.PUBLISHED)
        page = self.paginate_queryset(queryset)
        objects = list(page if page is not None else queryset)
        include_html = request.query_params.get("include_html", "false").lower() == "true"
        data = [
            timeline_payload(post, include_html=include_html, has_next=index < len(objects) - 1)
            for index, post in enumerate(objects)
        ]
        if page is not None:
            return self.get_paginated_response(data)
        return Response(data)

    @action(detail=True, methods=["get"], url_path="timeline")
    def timeline_detail(self, request, pk=None):
        post = self.get_object()
        if post.status != ReleaseStatus.PUBLISHED:
            return Response({"detail": "Release is not published."}, status=status.HTTP_404_NOT_FOUND)
        include_html = request.query_params.get("include_html", "false").lower() == "true"
        return Response(timeline_payload(post, include_html=include_html))

    @action(detail=False, methods=["get"], url_path="analytics")
    def analytics(self, request):
        return Response(dashboard_metrics(self.get_queryset()))

    @action(detail=False, methods=["get"], url_path="compare")
    def compare(self, request):
        before_id = request.query_params.get("before")
        after_id = request.query_params.get("after")
        if not before_id or not after_id:
            return Response(
                {"detail": "Both before and after release IDs are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = self.get_queryset()
        before = get_object_or_404(queryset, pk=before_id)
        after = get_object_or_404(queryset, pk=after_id)
        comparison = compare_posts(before, after)
        return Response({
            "before": {"id": before.pk, "version": before.version},
            "after": {"id": after.pk, "version": after.version},
            "change_count": comparison["change_count"],
            "summary_changes": comparison["summary_changes"],
            "section_changes": comparison["section_changes"],
        })

    @action(detail=False, methods=["post"], url_path="bulk-ingest")
    def bulk_ingest(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            instances = serializer.save(created_by=request.user, updated_by=request.user)
        return Response(self.get_serializer(instances, many=True).data, status=status.HTTP_201_CREATED)

class ApiReadAuditMixin:

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        instance = self.get_object()

        log_event(
            request=request,
            action=AuditLog.Action.READ,
            instance=instance,
            after=serialize_instance(
                instance
            ),
        )

        serializer = self.get_serializer(
            instance
        )

        return Response(
            serializer.data
        )






















class ChangelogTimelineApi(APIView):
    permission_classes = [AllowAny]
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        releases = []
        queryset = (Post.objects.select_related(*[f"type{x}" for x in "ABCDEFGHIJ"]).order_by(
            "-release_date",
            "-id")
        )

        for post in queryset:
            sections = []
            for letter in "ABCDEFGHIJ":
                subtitle = getattr(post, f"subTitle{letter}")
                category = getattr(post, f"type{letter}", None)
                content = getattr(post, f"post{letter}", None)
                text_content = strip_tags(str(content or "")).replace("&nbsp;", "").strip()

                if not text_content:
                    continue

                if not subtitle:
                    continue

                if not category:
                    continue

                sections.append({
                    "category":
                        category.name
                        if category
                        else "",
                    "subtitle": subtitle,
                    "content": content,
                })

            releases.append({
                "id": post.id,
                "version": post.version,
                "title": post.title,
                "description": post.desc,
                "release_date":
                    post.release_date,
                "sections": sections,
            })

        return Response(releases)


class AuditListView(TemplateView):
    template_name = "changelog/audit/audit_list.html"
    paginate_by = 25

    def get_queryset(self):
        # Keep your existing database query here.
        queryset = self.audit_log_queryset()

        version = self.request.GET.get("version", "").strip()
        model_name = self.request.GET.get("model", "").strip()
        start_date = self.request.GET.get("start_date", "").strip()
        end_date = self.request.GET.get("end_date", "").strip()
        query = self.request.GET.get("q", "").strip()

        # Keep your existing valid filters here.
        # Do not retain user/action filters if they were removed.

        return queryset.order_by("-created_at")

    def build_audit_row(self, log):
        return {
            "log": log,
            "version": self.get_version_for_log(log),
            "change_count": self.get_change_count(log),
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        queryset = self.get_queryset()
        paginator = Paginator(queryset, self.paginate_by)
        page_obj = paginator.get_page(self.request.GET.get("page"))

        context["paginator"] = paginator
        context["page_obj"] = page_obj
        context["is_paginated"] = paginator.num_pages > 1

        context["audit_rows"] = [
            self.build_audit_row(log)
            for log in page_obj.object_list
        ]

        query_params = self.request.GET.copy()
        query_params.pop("page", None)
        context["filter_query"] = query_params.urlencode()

        context["model_choices"] = self.get_model_choices()

        return context