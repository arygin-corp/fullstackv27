from django.contrib.auth import views as auth
from django.urls import path

from . import page_views

app_name = "apify_admin"

urlpatterns = [
    path("", page_views.dashboard, name="dashboard"),
    path("apis/", page_views.api_catalog, name="api_catalog"),
    path("apis/<uuid:pk>/", page_views.api_detail, name="api-detail"),
    path("apis/<uuid:pk>/publish/", page_views.api_publish, name="api-publish"),
    path("apis/<uuid:pk>/request/", page_views.request_access, name="api-request"),
    path("products/", page_views.products, name="products"),
    path("products/<uuid:pk>/", page_views.product_detail, name="api-product-detail"),
    path("policies/", page_views.policies, name="policies"),
    path("policies/<uuid:pk>/", page_views.policy_detail, name="policy-detail"),
    path("applications/", page_views.applications, name="applications"),
    path("applications/<uuid:pk>/", page_views.application_detail, name="client-application-detail"),
    path("credentials/", page_views.credentials, name="credentials"),
    path("credentials/<uuid:pk>/", page_views.credential_detail, name="credential-detail"),
    path("credentials/<uuid:pk>/secret/", page_views.credential_secret, name="credential-secret"),
    path("credentials/<uuid:pk>/rotate/", page_views.credential_rotate, name="credential-rotate"),
    path("credentials/<uuid:pk>/revoke/", page_views.credential_revoke, name="credential-revoke"),
    path("access-requests/", page_views.access_requests, name="access_requests"),
    path("access-requests/<uuid:pk>/", page_views.access_request_detail, name="access-request-detail"),
    path("access-requests/<uuid:pk>/approve/", page_views.approve_request, name="access-request-approve"),
    path("access-requests/<uuid:pk>/reject/", page_views.reject_request, name="access-request-reject"),
    path("subscriptions/", page_views.subscriptions, name="subscriptions"),
    path("subscriptions/<uuid:pk>/", page_views.subscription_detail, name="subscription-detail"),
    path("analytics/", page_views.analytics, name="analytics"),
    path("audit/", page_views.audit, name="audit"),
    path("audit/<uuid:pk>/", page_views.audit_detail, name="audit-detail"),
    path("settings/", page_views.settings_page, name="settings"),
    path("login/", auth.LoginView.as_view(template_name="apify_admin/auth/login.html"), name="login"),
    path("logout/", auth.LogoutView.as_view(), name="logout"),
]
