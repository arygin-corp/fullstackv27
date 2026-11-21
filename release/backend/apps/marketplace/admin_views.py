from datetime import timedelta
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.contrib.auth.decorators import login_required, permission_required
from django.db import transaction
from django.forms import modelform_factory
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView

from .forms import ProductForm, ProductImageFormSet
from .models import (
    ADGroup, Attribute, Badge, Catalog, Classification, Contact, DataSteward,
    Datatype, Domain, Organization, Platform, Product, Review, SearchQueryLog,
    SubDomain_1, SubDomain_2,
)

ADMIN_PREFIX = "marketplace_admin"

class AdminAccessMixin(LoginRequiredMixin, PermissionRequiredMixin):
    raise_exception = True

class DashboardView(AdminAccessMixin, TemplateView):
    permission_required = "marketplace.view_product"
    template_name = "gdx_admin/pages/marketplace/products/dashboard.html"

    def get_context_data(self, **kwargs):
        c = super().get_context_data(**kwargs)
        products = Product.objects.all()
        now = timezone.now()
        c.update({
            "page_title": "Marketplace Dashboard",
            "total_products": products.count(),
            "published_products": products.published().count(),
            "pending_products": products.filter(status="pending").count(),
            "draft_products": products.filter(status="draft").count(),
            "inactive_products": products.filter(is_active=False).count(),
            "domains_count": Domain.objects.count(),
            "contacts_count": Contact.objects.count(),
            "reviews_count": Review.objects.count(),
            "avg_rating": Review.objects.aggregate(v=Avg("rating"))["v"] or 0,
            "recent_products": products.select_related("domain", "datatype", "created_by").order_by("-created_at")[:8],
            "pending_queue": products.filter(status="pending").select_related("domain", "created_by").order_by("-created_at")[:8],
            "status_rows": products.values("status").annotate(total=Count("id")).order_by("status"),
            "domain_rows": Domain.objects.annotate(total=Count("product_domain")).order_by("-total")[:8],
            "recent_searches": SearchQueryLog.objects.select_related("user").order_by("-created_at")[:8],
            "new_this_month": products.filter(created_at__gte=now - timedelta(days=30)).count(),
        })
        return c

class AnalyticsView(AdminAccessMixin, TemplateView):
    permission_required = "marketplace.view_product"
    template_name = "gdx_admin/pages/marketplace/products/analytics.html"

    def get_context_data(self, **kwargs):
        c = super().get_context_data(**kwargs)
        monthly = list(Product.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Count("id")).order_by("-month")[:12])
        statuses = list(Product.objects.values("status").annotate(total=Count("id")).order_by("status"))
        domains = list(Domain.objects.annotate(total=Count("product_domain")).values("name", "total").order_by("-total")[:10])
        datatypes = list(Datatype.objects.annotate(total=Count("product")).values("name", "total").order_by("-total")[:10])
        ratings = list(Review.objects.values("rating").annotate(total=Count("id")).order_by("rating"))
        searches = list(SearchQueryLog.objects.values("query").annotate(total=Count("id")).order_by("-total")[:10])
        c.update({"page_title":"Marketplace Analytics","monthly":monthly,"statuses":statuses,"domains":domains,"datatypes":datatypes,"ratings":ratings,"searches":searches})
        return c

class ProductListView(AdminAccessMixin, ListView):
    permission_required = "marketplace.view_product"
    model = Product
    template_name = "gdx_admin/pages/marketplace/products/products/list.html"
    context_object_name = "products"
    paginate_by = 25
    def get_queryset(self):
        status=self.request.GET.get("status",""); domain=self.request.GET.get("domain",""); active=self.request.GET.get("active","")
        qs = Product.objects.hide_archived(status).select_related("domain","datatype","classification","org","created_by").prefetch_related("images").order_by("-updated_at")
        q=self.request.GET.get("q","").strip()
        if q: qs=qs.filter(Q(name__icontains=q)|Q(sku__icontains=q)|Q(short_desc__icontains=q))
        if status: qs=qs.filter(status=status)
        if domain.isdigit(): qs=qs.filter(domain_id=domain)
        if active == "active": qs=qs.filter(is_active=True)
        elif active == "inactive": qs=qs.filter(is_active=False)
        return qs
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c.update({"page_title":"Products","domains":Domain.objects.order_by("name"),"status_choices":Product._meta.get_field("status").choices}); return c

class ProductDetailView(AdminAccessMixin, DetailView):
    permission_required = "marketplace.view_product"
    model=Product; template_name="gdx_admin/pages/marketplace/products/products/detail.html"; context_object_name="product"
    def get_queryset(self):
        return Product.objects.select_related("domain","subdomain_2","subdomain_3","datatype","classification","org","team","created_by","updated_by","approved_by").prefetch_related("images","badge","keyword","attribute","reviews")

class ProductFormMixin(AdminAccessMixin):
    model=Product; form_class=ProductForm; template_name="gdx_admin/pages/marketplace/products/products/form.html"; success_url=reverse_lazy("marketplace_admin:product_list")
    def get_form_kwargs(self):
        k=super().get_form_kwargs(); k["request"]=self.request; return k
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs)
        c["image_formset"]=ProductImageFormSet(self.request.POST or None,self.request.FILES or None,instance=getattr(self,"object",None))
        c["page_title"]="Edit Product" if getattr(self,"object",None) and self.object.pk else "Create Product"
        return c
    def form_valid(self, form):
        fs=ProductImageFormSet(self.request.POST,self.request.FILES,instance=getattr(self,"object",None))
        if not fs.is_valid(): return self.form_invalid(form)
        with transaction.atomic():
            self.object=form.save(commit=False)
            if not self.object.pk: self.object.created_by=self.request.user
            self.object.updated_by=self.request.user; self.object.save(); form.save_m2m()
            fs.instance=self.object; fs.save()
        messages.success(self.request,"Product saved successfully."); return redirect(self.success_url)

class ProductCreateView(ProductFormMixin, CreateView): permission_required="marketplace.add_product"
class ProductUpdateView(ProductFormMixin, UpdateView): permission_required="marketplace.change_product"
class ProductDeleteView(AdminAccessMixin, DeleteView):
    permission_required="marketplace.delete_product"; model=Product; template_name="gdx_admin/pages/marketplace/products/products/delete.html"; success_url=reverse_lazy("marketplace_admin:product_list")
    def form_valid(self, form): messages.success(self.request,"Product deleted."); return super().form_valid(form)

class PendingApprovalView(AdminAccessMixin, ListView):
    permission_required="marketplace.change_product"; model=Product; template_name="gdx_admin/pages/marketplace/products/governance/pending.html"; context_object_name="products"; paginate_by=25
    def get_queryset(self): return Product.objects.filter(status="pending").select_related("domain","created_by","data_review_team").order_by("-created_at")

@login_required
@permission_required("marketplace.change_product", raise_exception=True)
@require_POST
def product_action(request, pk, action):
    product=get_object_or_404(Product,pk=pk)
    allowed={"approve":"approved","archive":"archived","draft":"draft","discontinue":"discontinued","activate":None,"deactivate":None}
    if action not in allowed: return JsonResponse({"ok":False,"error":"Unsupported action"},status=400)
    if action=="activate": product.is_active=True
    elif action=="deactivate": product.is_active=False
    else:
        product.status=allowed[action]
        if action=="approve": product.approved_by=request.user; product.approved_at=timezone.now()
    product.updated_by=request.user; product.save(); messages.success(request,f"{product.name} updated.")
    return redirect(request.POST.get("next") or "marketplace_admin:product_detail",pk=pk)

class TaxonomyView(AdminAccessMixin, TemplateView):
    permission_required="marketplace.view_domain"; template_name="gdx_admin/pages/marketplace/products/taxonomy/index.html"
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c.update({"page_title":"Taxonomy","domains":Domain.objects.annotate(product_total=Count("product_domain")).prefetch_related("domain__subdomain_1").order_by("name"),"datatypes":Datatype.objects.annotate(product_total=Count("product")).order_by("name"),"classifications":Classification.objects.annotate(product_total=Count("product")).order_by("name")}); return c

class GovernanceView(AdminAccessMixin, TemplateView):
    permission_required="marketplace.view_product"; template_name="gdx_admin/pages/marketplace/products/governance/overview.html"
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); qs=Product.objects.all(); c.update({"page_title":"Governance","review_required":qs.filter(data_review_required=True).count(),"review_pending":qs.filter(data_review_status="pending").count(),"pi_products":qs.filter(pi="Yes").count(),"spi_products":qs.filter(sensitive_pi="Yes").count(),"unclassified":qs.filter(classification__isnull=True).select_related("domain")[:20],"without_steward":qs.filter(data_steward__isnull=True).select_related("domain")[:20]}); return c

class PeopleView(AdminAccessMixin, TemplateView):
    permission_required="marketplace.view_contact"; template_name="gdx_admin/pages/marketplace/products/people/index.html"
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c.update({"page_title":"People & Ownership","contacts":Contact.objects.annotate(poc_total=Count("poc"),business_total=Count("business_contact")).order_by("name"),"stewards":DataSteward.objects.select_related("company_id").order_by("name"),"organizations":Organization.objects.annotate(product_total=Count("product")).order_by("name")}); return c

class ReviewListView(AdminAccessMixin, ListView):
    permission_required="marketplace.view_review"; model=Review; template_name="gdx_admin/pages/marketplace/products/reviews/list.html"; context_object_name="reviews"; paginate_by=25
    def get_queryset(self):
        qs = Review.objects.select_related("product","author").order_by("-created_at")
        q = self.request.GET.get("q","").strip()
        status = self.request.GET.get("status","").strip()
        rating = self.request.GET.get("rating","").strip()
        if q:
            qs = qs.filter(Q(title__icontains=q)|Q(comment__icontains=q)|Q(product__name__icontains=q))
        if status:
            qs = qs.filter(status=status)
        if rating.isdigit():
            qs = qs.filter(rating=int(rating))
        return qs
    def get_context_data(self, **kwargs):
        c = super().get_context_data(**kwargs)
        c["status_choices"] = Review._meta.get_field("status").flatchoices
        c["rating_choices"] = Review.STAR_CHOICES
        return c

class SearchAnalyticsView(AdminAccessMixin, ListView):
    permission_required="marketplace.view_searchquerylog"; model=SearchQueryLog; template_name="gdx_admin/pages/marketplace/products/search/index.html"; context_object_name="search_logs"; paginate_by=50
    def get_queryset(self):
        qs=SearchQueryLog.objects.select_related("user").order_by("-created_at"); q=self.request.GET.get("q","").strip(); return qs.filter(query__icontains=q) if q else qs
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c["top_queries"]=SearchQueryLog.objects.values("query").annotate(total=Count("id"),avg_results=Avg("results_count")).order_by("-total")[:15]; return c

class ReferenceDataView(AdminAccessMixin, TemplateView):
    permission_required="marketplace.view_product"; template_name="gdx_admin/pages/marketplace/products/reference/index.html"
    def get_context_data(self, **kwargs):
        c=super().get_context_data(**kwargs); c.update({"page_title":"Reference Data","catalogs":Catalog.objects.order_by("name"),"platforms":Platform.objects.order_by("name"),"badges":Badge.objects.order_by("name"),"attributes":Attribute.objects.order_by("type","name"),"ad_groups":ADGroup.objects.order_by("name")}); return c

class ExportCenterView(AdminAccessMixin, TemplateView):
    permission_required="marketplace.view_product"; template_name="gdx_admin/pages/marketplace/products/exports/index.html"

@login_required
@permission_required("marketplace.view_product", raise_exception=True)
def analytics_json(request):
    return JsonResponse({
        "statuses": list(Product.objects.values("status").annotate(total=Count("id")).order_by("status")),
        "domains": list(Domain.objects.annotate(total=Count("product_domain")).values("name","total").order_by("-total")[:10]),
        "monthly": [{"month":r["month"].strftime("%Y-%m") if r["month"] else "", "total":r["total"]} for r in Product.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Count("id")).order_by("month")[-12:]],
    })





# ============================================================
# DOMAIN CRUD
# ============================================================
class DomainListView(AdminAccessMixin, ListView):
    permission_required = "marketplace.view_domain"
    model = Domain
    template_name = (
        "gdx_admin/pages/marketplace/domains/domains/list.html"
    )
    context_object_name = "domains"
    paginate_by = 25

    def get_queryset(self):
        qs = Domain.objects.all().order_by("name")

        q = self.request.GET.get("q", "").strip()

        if q:
            qs = qs.filter(name__icontains=q)
        active = self.request.GET.get("active", "")
        if active == "active":
            qs = qs.filter(is_active=True)
        elif active == "inactive":
            qs = qs.filter(is_active=False)

        return qs


class DomainDetailView(
    AdminAccessMixin,
    DetailView
):
    permission_required = "marketplace.view_domain"
    model = Domain
    template_name = (
        "gdx_admin/pages/marketplace/domains/domains/detail.html"
    )
    context_object_name = "domain"


class DomainCreateView(
    AdminAccessMixin,
    CreateView
):
    permission_required = "marketplace.add_domain"
    model = Domain
    fields = ["name"]
    template_name = (
        "gdx_admin/pages/marketplace/domains/domains/form.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:domain_list"
        )


class DomainUpdateView(
    AdminAccessMixin,
    UpdateView
):
    permission_required = "marketplace.change_domain"
    model = Domain
    fields = ["name"]
    template_name = (
        "gdx_admin/pages/marketplace/domains/domains/form.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:domain_detail",
            kwargs={"pk": self.object.pk},
        )


class DomainDeleteView(
    AdminAccessMixin,
    DeleteView
):
    permission_required = "marketplace.delete_domain"
    model = Domain
    template_name = (
        "gdx_admin/pages/marketplace/domains/domains/delete.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:domain_list"
        )


# ============================================================
# SUBDOMAIN CRUD
# ============================================================

class SubDomainListView(
    AdminAccessMixin,
    ListView
):
    permission_required = "marketplace.view_subdomain_1"
    model = SubDomain_1
    template_name = (
        "gdx_admin/pages/marketplace/subdomains/subdomains/list.html"
    )
    context_object_name = "subdomains"
    paginate_by = 25

    def get_queryset(self):
        qs = (
            SubDomain_1.objects
            .select_related("domain")
            .order_by(
                "domain__name",
                "name"
            )
        )

        q = self.request.GET.get(
            "q",
            ""
        ).strip()

        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                |
                Q(domain__name__icontains=q)
            )
        active = self.request.GET.get("active", "")
        if active == "active":
            qs = qs.filter(is_active=True)
        elif active == "inactive":
            qs = qs.filter(is_active=False)
        domain = self.request.GET.get("domain", "").strip()
        if domain.isdigit():
            qs = qs.filter(domain_id=int(domain))

        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["filter_domains"] = Domain.objects.order_by("name")
        return context


class SubDomainDetailView(
    AdminAccessMixin,
    DetailView
):
    permission_required = "marketplace.view_subdomain_1"
    model = SubDomain_1
    template_name = (
        "gdx_admin/pages/marketplace/subdomains/subdomains/detail.html"
    )
    context_object_name = "subdomain"


class SubDomainCreateView(
    AdminAccessMixin,
    CreateView
):
    permission_required = "marketplace.add_subdomain_1"
    model = SubDomain_1
    fields = [
        "domain",
        "name"
    ]
    template_name = (
        "gdx_admin/pages/marketplace/subdomains/subdomains/form.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:subdomain_list"
        )


class SubDomainUpdateView(
    AdminAccessMixin,
    UpdateView
):
    permission_required = "marketplace.change_subdomain_1"
    model = SubDomain_1
    fields = [
        "domain",
        "name"
    ]
    template_name = (
        "gdx_admin/pages/marketplace/subdomains/subdomains/form.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:subdomain_detail",
            kwargs={
                "pk": self.object.pk
            }
        )


class SubDomainDeleteView(
    AdminAccessMixin,
    DeleteView
):
    permission_required = "marketplace.delete_subdomain_1"
    model = SubDomain_1
    template_name = (
        "gdx_admin/pages/marketplace/subdomains/subdomains/delete.html"
    )

    def get_success_url(self):
        return reverse(
            "marketplace_admin:subdomain_list"
        )

# ============================================================================
# GENERATED MARKETPLACE ADMIN MODULE INTEGRATION
# ============================================================================
# The generic base classes below keep the generated admin modules consistent
# while preserving model-specific permissions, templates, and URL names.

class MarketplaceModelQueryMixin:
    """Search/filter a model safely using fields that actually exist."""

    search_fields = ("name", "title", "description", "email", "query")

    def get_queryset(self):
        qs = super().get_queryset()
        field_names = {field.name for field in self.model._meta.get_fields()}

        if "updated_at" in field_names:
            qs = qs.order_by("-updated_at")
        elif "created_at" in field_names:
            qs = qs.order_by("-created_at")
        elif "name" in field_names:
            qs = qs.order_by("name")
        else:
            qs = qs.order_by("-pk")

        q = self.request.GET.get("q", "").strip()
        searchable = [name for name in self.search_fields if name in field_names]
        if q and searchable:
            expression = Q()
            for name in searchable:
                expression |= Q(**{f"{name}__icontains": q})
            qs = qs.filter(expression)

        status = self.request.GET.get("status", "").strip()
        if status and "is_active" in field_names:
            qs = qs.filter(is_active=status == "active")
        return qs


class MarketplaceDashboardBase(AdminAccessMixin, TemplateView):
    model = None

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.model.objects.all()
        fields = {field.name for field in self.model._meta.get_fields()}
        context["total_count"] = qs.count()
        context["active_count"] = qs.filter(is_active=True).count() if "is_active" in fields else qs.count()
        context["inactive_count"] = qs.filter(is_active=False).count() if "is_active" in fields else 0
        context["attention_count"] = context["inactive_count"]
        return context


class MarketplaceAnalyticsBase(MarketplaceDashboardBase):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["metrics"] = [
            {"label": "Total", "value": context["total_count"]},
            {"label": "Active", "value": context["active_count"]},
            {"label": "Inactive", "value": context["inactive_count"]},
        ]
        return context


class MarketplaceListBase(MarketplaceModelQueryMixin, AdminAccessMixin, ListView):
    paginate_by = 25


class MarketplaceDetailBase(AdminAccessMixin, DetailView):
    pass


class MarketplaceFormBase(AdminAccessMixin):
    fields = "__all__"

    def form_valid(self, form):
        messages.success(self.request, f"{self.model._meta.verbose_name.title()} saved successfully.")
        return super().form_valid(form)


class MarketplaceCreateBase(MarketplaceFormBase, CreateView):
    pass


class MarketplaceUpdateBase(MarketplaceFormBase, UpdateView):
    pass


class MarketplaceDeleteBase(AdminAccessMixin, DeleteView):
    def form_valid(self, form):
        messages.success(self.request, f"{self.model._meta.verbose_name.title()} deleted.")
        return super().form_valid(form)


class MarketplaceBulkBase(AdminAccessMixin, TemplateView):
    model = None
    success_url_name = None

    def post(self, request, *args, **kwargs):
        ids = [value.strip() for value in request.POST.get("ids", "").split(",") if value.strip()]
        action = request.POST.get("action")
        qs = self.model.objects.filter(pk__in=ids)
        fields = {field.name for field in self.model._meta.get_fields()}
        if action == "activate" and "is_active" in fields:
            qs.update(is_active=True)
        elif action == "deactivate" and "is_active" in fields:
            qs.update(is_active=False)
        elif action == "delete":
            qs.delete()
        else:
            messages.error(request, "Unsupported bulk action for this model.")
            return redirect(self.success_url_name)
        messages.success(request, "Bulk action completed.")
        return redirect(self.success_url_name)


class MarketplaceSearchBase(MarketplaceListBase):
    context_object_name = "results"


class MarketplaceExportBase(AdminAccessMixin, TemplateView):
    model = None
    export_name = "records"

    def post(self, request, *args, **kwargs):
        import csv
        fields = [field for field in self.model._meta.fields if not field.many_to_many]
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{self.export_name}.csv"'
        writer = csv.writer(response)
        writer.writerow([field.name for field in fields])
        for item in self.model.objects.all().iterator():
            writer.writerow([getattr(item, field.name) for field in fields])
        return response


class MarketplaceStaticFormPage(AdminAccessMixin, TemplateView):
    """Renders settings/access/rules pages until dedicated persistence models exist."""

    def post(self, request, *args, **kwargs):
        messages.info(request, "No persistence model is configured for this administration page.")
        return redirect(request.path)


class MarketplaceAuditBase(AdminAccessMixin, ListView):
    context_object_name = "audit_entries"
    paginate_by = 25

    def get_queryset(self):
        return self.model.objects.none()


def _module_classes(name, model, permission_model, folder, object_name, objects_name):
    """Build the standard view suite used by generated module templates."""
    prefix = f"marketplace.{permission_model}"
    templates = f"gdx_admin/pages/marketplace/{folder}"
    entity_folder = folder
    return {
        f"{name}DashboardView": type(f"{name}DashboardView", (MarketplaceDashboardBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/dashboard.html",
        }),
        f"{name}AnalyticsView": type(f"{name}AnalyticsView", (MarketplaceAnalyticsBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/analytics.html",
        }),
        f"{name}ListView": type(f"{name}ListView", (MarketplaceListBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/list.html", "context_object_name": objects_name,
        }),
        f"{name}DetailView": type(f"{name}DetailView", (MarketplaceDetailBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/detail.html", "context_object_name": object_name,
        }),
        f"{name}CreateView": type(f"{name}CreateView", (MarketplaceCreateBase,), {
            "model": model, "permission_required": f"marketplace.add_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/form.html",
        }),
        f"{name}UpdateView": type(f"{name}UpdateView", (MarketplaceUpdateBase,), {
            "model": model, "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/form.html",
        }),
        f"{name}DeleteView": type(f"{name}DeleteView", (MarketplaceDeleteBase,), {
            "model": model, "permission_required": f"marketplace.delete_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/delete.html",
        }),
        f"{name}BulkView": type(f"{name}BulkView", (MarketplaceBulkBase,), {
            "model": model, "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/{entity_folder}/bulk.html",
        }),
        f"{name}SearchView": type(f"{name}SearchView", (MarketplaceSearchBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/search/index.html",
        }),
        f"{name}ExportView": type(f"{name}ExportView", (MarketplaceExportBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/exports/index.html", "export_name": folder,
        }),
        f"{name}AuditView": type(f"{name}AuditView", (MarketplaceAuditBase,), {
            "model": model, "permission_required": f"marketplace.view_{permission_model}",
            "template_name": f"{templates}/audit/index.html",
        }),
        f"{name}AccessView": type(f"{name}AccessView", (MarketplaceStaticFormPage,), {
            "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/access/index.html",
        }),
        f"{name}SettingsView": type(f"{name}SettingsView", (MarketplaceStaticFormPage,), {
            "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/settings/index.html",
        }),
        f"{name}RuleListView": type(f"{name}RuleListView", (MarketplaceStaticFormPage,), {
            "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/rules/list.html",
        }),
        f"{name}RuleCreateView": type(f"{name}RuleCreateView", (MarketplaceStaticFormPage,), {
            "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/rules/form.html",
        }),
        f"{name}RuleUpdateView": type(f"{name}RuleUpdateView", (MarketplaceStaticFormPage,), {
            "permission_required": f"marketplace.change_{permission_model}",
            "template_name": f"{templates}/rules/form.html",
        }),
    }
















class MarketplaceModelQueryMixin:
    search_fields = ("name", "title", "description", "email", "query")

    def get_queryset(self):
        qs = super().get_queryset()
        fields = {field.name for field in self.model._meta.get_fields()}
        if "updated_at" in fields:
            qs = qs.order_by("-updated_at", "-pk")
        elif "created_at" in fields:
            qs = qs.order_by("-created_at", "-pk")
        elif "name" in fields:
            qs = qs.order_by("name")
        else:
            qs = qs.order_by("-pk")

        q = self.request.GET.get("q", "").strip()
        searchable = [field for field in self.search_fields if field in fields]
        if q and searchable:
            expression = Q()
            for field in searchable:
                expression |= Q(**{f"{field}__icontains": q})
            qs = qs.filter(expression)

        status = self.request.GET.get("status", "").strip()
        if status in {"active", "inactive"} and "is_active" in fields:
            qs = qs.filter(is_active=(status == "active"))
        return qs


class MarketplaceDashboardBase(AdminAccessMixin, TemplateView):
    model = None

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.model.objects.all()
        fields = {field.name for field in self.model._meta.get_fields()}
        total = qs.count()
        active = qs.filter(is_active=True).count() if "is_active" in fields else total
        inactive = qs.filter(is_active=False).count() if "is_active" in fields else 0
        order = "-updated_at" if "updated_at" in fields else "-created_at" if "created_at" in fields else "-pk"
        context.update({
            "total_count": total,
            "active_count": active,
            "inactive_count": inactive,
            "attention_count": inactive,
            "recent_items": qs.order_by(order)[:8],
            "stats": [
                {"label": "Total", "value": total},
                {"label": "Active", "value": active},
                {"label": "Inactive", "value": inactive},
            ],
        })
        return context


class MarketplaceAnalyticsBase(MarketplaceDashboardBase):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["metrics"] = [
            {"label": "Total", "value": context["total_count"]},
            {"label": "Active", "value": context["active_count"]},
            {"label": "Inactive", "value": context["inactive_count"]},
        ]
        return context


class MarketplaceListBase(MarketplaceModelQueryMixin, AdminAccessMixin, ListView):
    paginate_by = 25


class DomainDashboardView(AdminAccessMixin, TemplateView):
    permission_required = "marketplace.view_domain"
    template_name = "gdx_admin/pages/marketplace/domains/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        domains = Domain.objects.all()
        products = Product.objects.all()

        total_domains = domains.count()
        active_domains = domains.filter(is_active=True).count()
        inactive_domains = total_domains - active_domains
        mapped_products = products.filter(domain__isnull=False).count()
        unmapped_products = products.filter(domain__isnull=True).count()
        total_products = mapped_products + unmapped_products
        coverage_percent = round((mapped_products / total_products) * 100) if total_products else 0

        annotated_domains = domains.annotate(
            product_count=Count("product_domain", distinct=True),
            subdomain_count=Count("domain", distinct=True),
        )

        context.update({
            "page_title": "Domains Dashboard",
            "total_domains": total_domains,
            "active_domains": active_domains,
            "inactive_domains": inactive_domains,
            "mapped_products": mapped_products,
            "unmapped_products": unmapped_products,
            "coverage_percent": coverage_percent,
            "kpi_cards": [
                {"label": "Total Domains", "value": total_domains, "help_text": "All taxonomy domains", "icon": "ti ti-category", "bg_class": "bg-primary-transparent", "text_class": "text-primary"},
                {"label": "Active Domains", "value": active_domains, "help_text": "Available for assignment", "icon": "ti ti-circle-check", "bg_class": "bg-success-transparent", "text_class": "text-success"},
                {"label": "Subdomains", "value": SubDomain_1.objects.count(), "help_text": "Level 2 taxonomy nodes", "icon": "ti ti-hierarchy-2", "bg_class": "bg-info-transparent", "text_class": "text-info"},
                {"label": "Mapped Products", "value": mapped_products, "help_text": f"{coverage_percent}% taxonomy coverage", "icon": "ti ti-package", "bg_class": "bg-warning-transparent", "text_class": "text-warning"},
            ],
            "recent_domains": annotated_domains.select_related("updated_by").order_by("-updated_at", "-pk")[:8],
            "top_domains": annotated_domains.order_by("-product_count", "name")[:6],
        })
        return context


class DomainAnalyticsView(AdminAccessMixin, TemplateView):
    permission_required = "marketplace.view_domain"
    template_name = "gdx_admin/pages/marketplace/domains/analytics.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        domains = Domain.objects.all()
        products = Product.objects.all()

        total_domains = domains.count()
        active_domains = domains.filter(is_active=True).count()
        inactive_domains = total_domains - active_domains
        mapped_products = products.filter(domain__isnull=False).count()
        unmapped_products = products.filter(domain__isnull=True).count()
        total_products = mapped_products + unmapped_products
        coverage_percent = round(mapped_products * 100 / total_products, 1) if total_products else 0

        monthly_rows = list(
            domains.annotate(month=TruncMonth("created_at"))
            .values("month").annotate(total=Count("id"))
            .order_by("month")
        )[-12:]

        suite = list(
            domains.annotate(
                product_count=Count("product_domain", distinct=True),
                subdomain_1_count=Count("domain", distinct=True),
                subdomain_2_count=Count("domain__subdomain_1", distinct=True),
            ).order_by("-product_count", "name")
        )
        denominator = mapped_products or 1
        for domain in suite:
            domain.share_percent = round(domain.product_count * 100 / denominator, 1)

        top = suite[:10]
        context.update({
            "page_title": "Domains Analytics",
            "total_domains": total_domains,
            "mapped_products": mapped_products,
            "unmapped_products": unmapped_products,
            "coverage_percent": coverage_percent,
            "subdomain_1_total": SubDomain_1.objects.count(),
            "subdomain_2_total": SubDomain_2.objects.count(),
            "kpi_cards": [
                {"label":"Total Domains","value":total_domains,"help_text":"All level 1 domains","icon":"ti ti-category","bg_class":"bg-primary-transparent","text_class":"text-primary"},
                {"label":"Active Domains","value":active_domains,"help_text":f"{inactive_domains} inactive","icon":"ti ti-circle-check","bg_class":"bg-success-transparent","text_class":"text-success"},
                {"label":"Mapped Products","value":mapped_products,"help_text":f"{coverage_percent}% coverage","icon":"ti ti-package","bg_class":"bg-info-transparent","text_class":"text-info"},
                {"label":"Unmapped Products","value":unmapped_products,"help_text":"Products needing a domain","icon":"ti ti-alert-triangle","bg_class":"bg-warning-transparent","text_class":"text-warning"},
            ],
            "monthly_labels": [r["month"].strftime("%b %Y") for r in monthly_rows if r["month"]],
            "monthly_values": [r["total"] for r in monthly_rows if r["month"]],
            "status_values": [active_domains, inactive_domains],
            "product_domain_labels": [d.name for d in top],
            "product_domain_values": [d.product_count for d in top],
            "domain_suite": suite,
        })
        return context