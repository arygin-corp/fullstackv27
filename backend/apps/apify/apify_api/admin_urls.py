from django.contrib.auth import views as auth
from django.urls import path
from django.views.generic import TemplateView

app_name = "apify_admin"

urlpatterns = [
    path("", TemplateView.as_view(template_name="apify_admin/dashboard/dashboard.html"), name="dashboard",),
    path("apis/", TemplateView.as_view(template_name="apify_admin/api_catalog/list.html"), name="api_catalog",),
    path("products/", TemplateView.as_view(template_name="apify_admin/api_products/list.html"), name="products",),
    path("policies/", TemplateView.as_view(template_name="apify_admin/policies/list.html"), name="policies",),
    path("applications/", TemplateView.as_view(template_name="apify_admin/client_applications/list.html"), name="applications",),
    path("audit/", TemplateView.as_view(template_name="apify_admin/audit/list.html"), name="audit",),
    path("applications/", TemplateView.as_view(template_name="apify_admin/client_applications/list.html"), name="applications"),
    path("credentials/", TemplateView.as_view(template_name="apify_admin/client_credentials/list.html"), name="credentials"),
    path("access-requests/", TemplateView.as_view(template_name="apify_admin/access_requests/list.html"), name="access_requests"),
    path("subscriptions/", TemplateView.as_view(template_name="apify_admin/subscriptions/list.html"), name="subscriptions"),
    path("analytics/", TemplateView.as_view(template_name="apify_admin/analytics/overview.html"), name="analytics"),
    path("audit/", TemplateView.as_view(template_name="apify_admin/audit/list.html"), name="audit"),
    path("settings/", TemplateView.as_view(template_name="apify_admin/settings/index.html"), name="settings"),
    path("login/", auth.LoginView.as_view(template_name="apify_admin/auth/login.html"), name="login",),
    path("logout/", auth.LogoutView.as_view(), name="logout",),
]