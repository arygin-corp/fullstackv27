from django.urls import path

from . import admin_views as views
from . import record_pages

app_name = "marketplace_admin"

urlpatterns = [
    path("admin/dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("admin/analytics/", views.AnalyticsView.as_view(), name="analytics"),
    path("admin/analytics/data/", views.analytics_json, name="analytics_json"),
    path("admin/products/", views.ProductListView.as_view(), name="product_list"),
    path("admin/products/new/", views.ProductCreateView.as_view(), name="product_create"),
    path("admin/products/<int:pk>/", views.ProductDetailView.as_view(), name="product_detail"),
    path("admin/products/<int:pk>/edit/", views.ProductUpdateView.as_view(), name="product_update"),
    path("admin/products/<int:pk>/delete/", views.ProductDeleteView.as_view(), name="product_delete"),
    path("admin/products/<int:pk>/<str:action>/", views.product_action, name="product_action"),
    path("admin/approvals/", views.PendingApprovalView.as_view(), name="pending"),
    path("admin/governance/", views.GovernanceView.as_view(), name="governance"),
    path("admin/taxonomy/", views.TaxonomyView.as_view(), name="taxonomy"),
    path("admin/people/", views.PeopleView.as_view(), name="people"),
    path("admin/reviews/", views.ReviewListView.as_view(), name="reviews"),
    path("admin/search/", views.SearchAnalyticsView.as_view(), name="search"),
    path("admin/reference/", views.ReferenceDataView.as_view(), name="reference"),
    path("admin/exports/", views.ExportCenterView.as_view(), name="exports"),

    # Domains
    path("admin/domains/dashboard/", views.DomainDashboardView.as_view(), name="domain_dashboard", ),
    path("admin/domains/analytics/", views.DomainAnalyticsView.as_view(), name="domain_analytics", ),
    path("admin/domains/", views.DomainListView.as_view(), name="domain_list"),
    path("admin/domains/new/", views.DomainCreateView.as_view(), name="domain_create"),
    path("admin/domains/<int:pk>/", views.DomainDetailView.as_view(), name="domain_detail"),
    path("admin/domains/<int:pk>/edit/", views.DomainUpdateView.as_view(), name="domain_update"),
    path("admin/domains/<int:pk>/delete/", views.DomainDeleteView.as_view(), name="domain_delete"),

    # Subdomains
    path("admin/subdomains/", views.SubDomainListView.as_view(), name="subdomain_list"),
    path("admin/subdomains/new/", views.SubDomainCreateView.as_view(), name="subdomain_create"),
    path("admin/subdomains/<int:pk>/", views.SubDomainDetailView.as_view(), name="subdomain_detail"),
    path("admin/subdomains/<int:pk>/edit/", views.SubDomainUpdateView.as_view(), name="subdomain_update"),
    path("admin/subdomains/<int:pk>/delete/", views.SubDomainDeleteView.as_view(), name="subdomain_delete"),

    path("admin/records/<slug:slug>/", record_pages.RecordListView.as_view(), name="record_list"),
    path("admin/records/<slug:slug>/new/", record_pages.RecordCreateView.as_view(), name="record_create"),
    path("admin/records/<slug:slug>/<int:pk>/", record_pages.RecordDetailView.as_view(), name="record_detail"),
    path("admin/records/<slug:slug>/<int:pk>/edit/", record_pages.RecordUpdateView.as_view(), name="record_update"),
    path("admin/records/<slug:slug>/<int:pk>/delete/", record_pages.RecordDeleteView.as_view(), name="record_delete"),
]

