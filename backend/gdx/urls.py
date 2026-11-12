from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include, re_path, reverse_lazy
from django.conf import settings
from django.views.static import serve
# from gdx import views
from .views import MyPasswordSetView, MyPasswordChangeView
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from apps.notifications.monitoring.views import alerts_view, health_view, live_view, ready_view, startup_view, metrics_view
from . import views
from .theme_preview import snapshot as theme_preview_snapshot
from .forms import GDXPasswordResetForm, GDXSetPasswordForm

urlpatterns = [
    path('marketplace/', include("apps.marketplace.urls")),
    path("view/endpoint/requests/", include("apps.third_party_apis.modules.onets_order_history.urls")),
    # AUTH - GDX USERS
    path('account/signup/', TemplateView.as_view(template_name="gdx_users/apps/account/signup.html"), name='signup'),
    path('account/', include('allauth.urls')),
    path('account/login/', TemplateView.as_view(template_name="gdx_users/apps/account/login.html"), name='account_login_page'),
    path('account/logout/', TemplateView.as_view(template_name="account/logout-success.html"), name='logout'),
    path('account/session/timeout', TemplateView.as_view(template_name="account/lock-screen.html"), name='lockscreen'),
    path('accounts/password/change/', login_required(MyPasswordChangeView.as_view()), name="account_change_password"),
    path('accounts/password/set/', login_required(MyPasswordSetView.as_view()), name="account_set_password"),
    path('microsoft_authentication/', include('microsoft_authentication.urls')),
    path("login/", views.GDXLoginView.as_view(), name="login"),
    path("not-authorized/", views.not_authorized, name="not_authorized"),
    path("header/environment/", views.set_header_environment, name="set_header_environment"),
    path("logout/", auth_views.LogoutView.as_view(template_name="gdx_users/apps/account/logout.html"), name="logout"),
    path("register/", views.register, name="register"),
    path("lock-screen/", views.lock_screen, name="lock_screen"),
    path("password-reset/", auth_views.PasswordResetView.as_view(template_name="gdx_admin/auth/password_reset_form.html", email_template_name="gdx_admin/auth/password_reset_email.html", subject_template_name="gdx_admin/auth/password_reset_subject.txt", form_class=GDXPasswordResetForm, success_url=reverse_lazy("gdx_admin:password_reset_done")), name="password_reset"),
    path("password-reset/done/", auth_views.PasswordResetDoneView.as_view(template_name="gdx_admin/auth/password_reset_done.html"), name="password_reset_done"),
    path("reset/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(template_name="gdx_admin/auth/password_reset_confirm.html", form_class=GDXSetPasswordForm, success_url=reverse_lazy("gdx_admin:password_reset_complete")), name="password_reset_confirm"),
    path("reset/complete/", auth_views.PasswordResetCompleteView.as_view(template_name="gdx_admin/auth/password_reset_complete.html"), name="password_reset_complete"),

    # GDX CONTENT USERS

    # GLOBAL API URLS
    path('api/', include('apps.api.urls')),
    path("api/theme-preview/snapshot/", theme_preview_snapshot, name="theme_preview_snapshot"),
    path("api/changelog/", include("apps.changelog.urls")),
    path("api/new/product/intake/", include("apps.third_party_apis.modules.product_intake.urls", namespace="intake")),
    path("api/marketplace/", include("apps.marketplace.admin_urls")),
    path("api/pages/", include("apps.pages.api_urls")),
    path("api/people/", include("apps.people.urls")),
    path("api/forms/", include("apps.forms.urls")),
    path("api/integrations/data-access-request/", include("apps.third_party_apis.modules.data_access_request.urls", namespace="data_access_request")),
    path("api/workflow/",include(("apps.workflow_engine.urls", "workflow_api"), namespace="workflow_api",)),
    path("api/orders/", include("apps.orders.urls")),
    path("api/profiles/", include("apps.profiles.api_urls")),
    path("api/v1/", include("apps.notifications.api_v1.urls")),
    path("api/healthz/", health_view, name="healthz"),
    path("api/health/live/", live_view, name="health_live"),
    path("api/health/ready/", ready_view, name="health_ready"),
    path("api/health/startup/", startup_view, name="health_startup"),
    path("api/monitoring/metrics/", metrics_view, name="metrics"),
    path("api/monitoring/alerts/", alerts_view, name="alerts"),
    path("api/ai/chat/", include("apps.third_party_apis.modules.vikki.chat.urls")),
    path("api/ai/evaluation/", include("evaluation_api.urls")),
    # path("api/notifications/", include("apps.notifications.urls")),
    path("api/product-checkout/", include("apps.product_checkout.urls")),
    path("api/integrations/", include(("apps.third_party_apis.api_urls", "third_party_api"), namespace="third_party_api")),
    path("api/integrations/", include("apps.third_party_apis.modules.denodo.urls")),
    path("api/integrations/people-finder/", include(("apps.third_party_apis.modules.people_finder.urls", "people"), namespace="people_finder_directory")),
    path("api/integrations/tbdp-pods/", include("apps.third_party_apis.modules.tbdp_pods.urls", namespace="tbdp_pods")),
    path("api/marketplace/", include(( "apps.third_party_apis.modules.checkout.urls", "data_marketplace_checkout",), namespace="data_marketplace_checkout")),


    # ADMIN
    path('admin/', admin.site.urls),

    # SUPER ADMINISTRATORS - GDX ADMIN
    path("sa/", views.staff_home, name="staff_home"),
    path("sa/dar/", include(("apps.forms.admin_urls", "dar-admin"), namespace="dar-admin")),
    path("sa/checkout/", include("apps.third_party_apis.modules.checkout.page_urls", namespace="checkout_pages")),
    path("changelog/", include(("apps.changelog.admin_urls", "changelog"), namespace="changelog_staff")),
    path("sa/intake/", include("apps.third_party_apis.modules.product_intake.admin_urls", namespace="intake")),
    path("sa/orders/", include("apps.orders.urls")),
    path('sa/teams/', include("apps.teams.urls")),
    path('sa/notifications/', include('apps.notifications.urls', namespace='notifications')),
    path("sa/people/", include("apps.people.urls")),
    path("sa/marketplace/", include("apps.marketplace.admin_urls")),
    path("sa/workflow/", include(("apps.workflow_engine.urls_v2", "workflow"), namespace="workflow",)),
    path("sa/workflow/", include(("apps.workflow_engine.template_urls", "workflow_templates"), namespace="workflow_templates",)),
    path("sa/pages/", include("apps.pages.urls")),
    path("sa/modules/", include("apps.third_party_apis.page_urls"),),
    path("sa/modules/", include(("apps.third_party_apis.page_urls", "third_party_api_pages"), namespace="third_party_api_pages"),),
    path("sa/integrations/", include(("apps.third_party_apis.operations_urls", "third_party_api_ops"), namespace="third_party_api_ops"),),
    path("maintenance/", views.maintenance, name="maintenance"),
    path("sa/settings/", views.platform_settings, name="platform_settings"),
    path("sa/templates/default.html", views.default_template, name="default_template"),
    path("sa/templates/default_page_header.html", views.default_template, name="default_page_header"),
    path("sa/templates/default_color_theme.html", views.default_template, name="default_color_theme"),
    path("sa/templates/default_ui_theme.html", views.default_template, name="default_ui_theme"),
    path("sa/templates/default_cards.html", views.default_template, name="default_cards"),
    path("sa/templates/default_charts.html", views.default_template, name="default_charts"),
    path("sa/deployment/", include(("gdx.deployment_urls", "deployment"), namespace="deployment")),
    path("sa/command-center/", include(("apps.third_party_apis.modules.command_center.urls", "command_center"), namespace="command_center")),
    # Vexlora-shaped theme pages (mirrors http://127.0.0.1:3000/pages/dashboard/.../index.html)
    path("pages/", include(("gdx.theme_pages_urls", "theme_pages"), namespace="theme_pages")),
    path("sa/microsoft-teams/", include(("apps.third_party_apis.modules.microsoft_teams.urls", "microsoft_teams"), namespace="microsoft_teams")),
    path("sa/microsoft-email/", include(("apps.third_party_apis.modules.microsoft_email.urls", "microsoft_email"), namespace="microsoft_email")),
    path("sa/google-analytics/", include(("apps.third_party_apis.modules.google_analytics.urls", "google_analytics"), namespace="google_analytics")),
    path("sa/documentation/", views.documentation_hub, name="documentation_sites"),
    path("sa/documentation/<slug:site>/<path:asset>", views.documentation_asset, name="documentation_asset"),
    path("sa/modules/aws/", include(("apps.third_party_apis.modules.aws.urls", "third_party_api_aws"), namespace="third_party_api_aws"),),

    # PAGES
    path('', views.HomeView.as_view(), name='home'),
    path('ai/', include("apps.suggestedAI.urls")),


    # APIFY CONSOLE
    path("sa/apify/v1/", include("apps.third_party_apis.modules.apify_platforms.apify_api.urls", namespace="apify_api",),),
    path("sa/apify/sandbox/", include("apps.third_party_apis.modules.apify_platforms.apify_api.admin_urls", namespace="apify_admin",),),
    path("sa/apify/test/", views.apify_environment_redirect, {"environment": "test"}),
    path("sa/apify/test/<path:rest>", views.apify_environment_redirect, {"environment": "test"}),
    path("sa/apify/prod/", views.apify_environment_redirect, {"environment": "prod"}),
    path("sa/apify/prod/<path:rest>", views.apify_environment_redirect, {"environment": "prod"}),

    # THIRD PARTY
    path('select2/', include('django_select2.urls')),
    path('ckeditor/', include('django_ckeditor_5.urls')),
]

urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]

# Admin Branding
admin.site.site_header = "GDX"
admin.site.site_title = "Dashboard"
admin.site.index_title = "Dashboard"