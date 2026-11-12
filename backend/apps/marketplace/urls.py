import tempfile
from pathlib import Path

from django.http import FileResponse, Http404
from django.urls import include, path
from rest_framework import routers
from .api_views import ProductJsonViewSet, DomainJsonViewSet, HybridProductSearchViewSet, SearchSuggestionsViewSet
from .review_api import MyProductReviewView, ProductReviewListView
from .resource_api import resource_routes
from .html_pages import CatalogImageUploadView, MarketplaceCreatePage, MarketplaceDeletePage, MarketplaceDetailPage, MarketplaceEditPage
from .page_views import MarketplaceHomeView
from .system_badges import system_badge_directory
from .template_pages import MarketplaceTemplatePage
from apps.orders.staff_pages import RequestTableView, TaskTableView
from .views import NotificationMenuView, ProductCreateView, ProductDeleteView, ProductDetailView, ProductUnarchiveView, ProductUpdateView, ReviewWorkflowView
from .models import (
    Badge,
    Catalog,
    Classification,
    Contact,
    DataSteward,
    Review,
    Datatype,
    Domain,
    Keyword,
    OneTSDomain,
    Platform,
    Product,
    SubDomain_1,
    SubDomain_2,
)

app_name = "marketplace"

router = routers.DefaultRouter()

router.register(r'products', ProductJsonViewSet, basename='api-products')
router.register(r'domains', DomainJsonViewSet, basename='api-domains')
router.register(r"search", HybridProductSearchViewSet, basename="product-search",)
router.register(r"search/suggestions", SearchSuggestionsViewSet, basename="search-suggestions",)
for route, basename, viewset in resource_routes():
    router.register(route, viewset, basename=basename)

product_list = ProductJsonViewSet.as_view({"get": "list",})
product_detail = ProductJsonViewSet.as_view({"get": "retrieve",})

def system_badge_image(request, filename):
    directory = system_badge_directory().resolve()
    source = (directory / filename).resolve()
    if source.parent != directory or not source.is_file():
        raise Http404("System badge was not found.")
    cache_dir = Path(tempfile.gettempdir()) / "gdx-system-badges"
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / filename
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        from PIL import Image

        image = Image.open(source)
        image.thumbnail((256, 256))
        image.save(target, "PNG", optimize=True)
    return FileResponse(open(target, "rb"), content_type="image/png")


def _page(template, title, key, count_key, model, kind, search_fields, select_related=()):
    return MarketplaceTemplatePage.as_view(
        template_name=template,
        page_title=title,
        context_key=key,
        count_key=count_key,
        record_model=model,
        row_kind=kind,
        search_fields=search_fields,
        select_related=select_related,
    )


def _create(prefix, url_prefix, model):
    return path(
        f"{url_prefix}/new/",
        MarketplaceCreatePage.as_view(
            model=model,
            template_name="gdx_users/apps/marketplace/partials/record_form.html",
            route_prefix=prefix,
        ),
        name=f"{prefix}-create",
    )


def _html(prefix, url_prefix, template_folder, model):
    base = f"gdx_users/apps/marketplace/{template_folder}"
    return [
        path(f"{url_prefix}/<int:pk>/", MarketplaceDetailPage.as_view(model=model, template_name=f"{base}/detail.html", route_prefix=prefix), name=f"{prefix}-detail"),
        path(f"{url_prefix}/<int:pk>/edit/", MarketplaceEditPage.as_view(model=model, template_name=(f"{base}/edit.html" if prefix == "review" else "gdx_users/apps/marketplace/partials/record_form.html"), route_prefix=prefix), name=f"{prefix}-edit"),
        path(f"{url_prefix}/<int:pk>/delete/", MarketplaceDeletePage.as_view(model=model, template_name=f"{base}/delete.html", route_prefix=prefix), name=f"{prefix}-delete"),
    ]


urlpatterns = [
    path("", MarketplaceHomeView.as_view(), name="home"),
    path("domains/", _page("gdx_users/apps/marketplace/domains/index.html", "Domains", "domains", "total_domains_count", Domain, "domain", ("name",)), name="domain-index"),
    _create("domain", "domains", Domain),
    path("subdomains/", _page("gdx_users/apps/marketplace/subdomains_1/index.html", "Subdomains Level 1", "subdomains", "total_subdomains_count", SubDomain_1, "subdomain1", ("name", "domain__name"), ("domain",)), name="subdomain1-index"),
    _create("subdomain1", "subdomains", SubDomain_1),
    path("subdomains-level-2/", _page("gdx_users/apps/marketplace/subdomains_2/index.html", "Subdomains Level 2", "subdomains", "total_subdomains_count", SubDomain_2, "subdomain2", ("name", "subdomain_1__name", "subdomain_1__domain__name"), ("subdomain_1", "subdomain_1__domain")), name="subdomain2-index"),
    _create("subdomain2", "subdomains-level-2", SubDomain_2),
    path("products/", _page("gdx_users/apps/marketplace/products/index.html", "Products", "products", "total_products_count", Product, "product", ("name", "domain__name", "datatype__name", "data_steward__name"), ("domain", "datatype", "data_steward")), name="product-index"),
    path("reviews/", _page("gdx_users/apps/marketplace/reviews/index.html", "Reviews", "reviews", "total_reviews_count", Review, "review", ("title", "product__name", "author__username"), ("product", "author")), name="review-index"),
    path("reviews/<int:pk>/workflow/", ReviewWorkflowView.as_view(), name="review-workflow"),
    path("notifications/", NotificationMenuView.as_view(), name="notification-index"),
    path("requests/", RequestTableView.as_view(), name="request-index"),
    path("tasks/", TaskTableView.as_view(), name="task-index"),
    path("products/new/", ProductCreateView.as_view(), name="product-create"),
    path("classifications/", _page("gdx_users/apps/marketplace/classifications/index.html", "Classifications", "classifications", "total_classifications_count", Classification, "classification", ("name", "value")), name="classification-index"),
    _create("classification", "classifications", Classification),
    path("badges/", _page("gdx_users/apps/marketplace/badges/index.html", "Badges", "badges", "total_badges_count", Badge, "badge", ("name",)), name="badge-index"),
    _create("badge", "badges", Badge),
    path("keywords/", _page("gdx_users/apps/marketplace/keywords/index.html", "Keywords", "keywords", "total_keywords_count", Keyword, "keyword", ("name",)), name="keyword-index"),
    _create("keyword", "keywords", Keyword),
    path("datatypes/", _page("gdx_users/apps/marketplace/datatypes/index.html", "Datatypes", "datatypes", "total_datatypes_count", Datatype, "datatype", ("name", "value")), name="datatype-index"),
    _create("datatype", "datatypes", Datatype),
    path("platforms/", _page("gdx_users/apps/marketplace/platforms/index.html", "Platforms", "platforms", "total_platforms_count", Platform, "platform", ("name",)), name="platform-index"),
    _create("platform", "platforms", Platform),
    path("contacts/", _page("gdx_users/apps/marketplace/contacts/index.html", "Contacts", "contacts", "total_contacts_count", Contact, "contact", ("name", "email")), name="contact-index"),
    _create("contact", "contacts", Contact),
    path("catalogs/", _page("gdx_users/apps/marketplace/catalogs/index.html", "Catalogs", "catalogs", "total_catalogs_count", Catalog, "catalog", ("name",)), name="catalog-index"),
    _create("catalog", "catalogs", Catalog),
    path("catalogs/<int:pk>/image/", CatalogImageUploadView.as_view(), name="catalog-image"),
    path("data-stewards/", _page("gdx_users/apps/marketplace/datastewards/index.html", "Data Stewards", "datastewards", "total_datastewards_count", DataSteward, "steward", ("name", "email", "company_id__name"), ("company_id",)), name="datasteward-index"),
    _create("datasteward", "data-stewards", DataSteward),
    path("one-ts-domains/", _page("gdx_users/apps/marketplace/onetsdomains/index.html", "1TS Domains", "onetsdomains", "total_onetsdomains_count", OneTSDomain, "onets", ("name", "control_group", "group_name", "data_steward__name"), ("data_steward",)), name="onetsdomain-index"),
    _create("onetsdomain", "one-ts-domains", OneTSDomain),
    *_html("domain", "domains", "domains", Domain),
    *_html("subdomain1", "subdomains", "subdomains_1", SubDomain_1),
    *_html("subdomain2", "subdomains-level-2", "subdomains_2", SubDomain_2),
    path("products/<int:pk>/unarchive/", ProductUnarchiveView.as_view(), name="product-unarchive"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/<int:pk>/edit/", ProductUpdateView.as_view(), name="product-edit"),
    path("products/<int:pk>/delete/", ProductDeleteView.as_view(), name="product-delete"),
    *_html("review", "reviews", "reviews", Review),
    *_html("classification", "classifications", "classifications", Classification),
    *_html("badge", "badges", "badges", Badge),
    *_html("keyword", "keywords", "keywords", Keyword),
    *_html("datatype", "datatypes", "datatypes", Datatype),
    *_html("platform", "platforms", "platforms", Platform),
    *_html("contact", "contacts", "contacts", Contact),
    *_html("catalog", "catalogs", "catalogs", Catalog),
    *_html("datasteward", "data-stewards", "datastewards", DataSteward),
    *_html("onetsdomain", "one-ts-domains", "onetsdomains", OneTSDomain),
    path("system-badges/<str:filename>", system_badge_image, name="system-badge-image"),
    path("api/products/<str:pk>/view/", ProductJsonViewSet.as_view({"post": "record_detail_view"}), name="api-product-view"),
    path("api/products/<str:pk>/reviews/me/", MyProductReviewView.as_view(), name="api-product-review-me"),
    path("api/products/<str:pk>/reviews/", ProductReviewListView.as_view(), name="api-product-reviews"),
    path('api/', include(router.urls)),
    path("api/products/<str:pk>/", product_detail, name="api-products-detail",),
]





