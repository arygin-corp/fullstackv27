"""Staff list, detail, edit, and delete pages for Marketplace models."""

from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db.models import ProtectedError, Q
from django.forms import modelform_factory
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import CreateView, DeleteView, DetailView, ListView, UpdateView

from .admin_views import AdminAccessMixin
from .models import (
    ADGroup,
    AlternateApprover,
    Attribute,
    AttributeType,
    Badge,
    Catalog,
    Classification,
    Company,
    Contact,
    DataSteward,
    Datatype,
    FulfillmentTeam,
    Keyword,
    OneTSDomain,
    Organization,
    Platform,
    ProductImage,
    SubDomain_2,
)

AUDIT_FIELDS = {"created_by", "created_at", "updated_by", "updated_at"}
SKIP_FIELDS = AUDIT_FIELDS | {"sku"}

RECORDS = (
    ("product-images", "Product Images", "Product image", ProductImage),
    ("subdomains-level-3", "Subdomains Level 3", "Subdomain", SubDomain_2),
    ("datatypes", "Datatypes", "Datatype", Datatype),
    ("classifications", "Classifications", "Classification", Classification),
    ("contacts", "Contacts", "Contact", Contact),
    ("data-stewards", "Data Stewards", "Data steward", DataSteward),
    ("organizations", "Organizations", "Organization", Organization),
    ("companies", "Companies", "Company", Company),
    ("catalogs", "Catalogs", "Catalog", Catalog),
    ("platforms", "Platforms", "Platform", Platform),
    ("badges", "Badges", "Badge", Badge),
    ("keywords", "Keywords", "Keyword", Keyword),
    ("attribute-types", "Attribute Types", "Attribute type", AttributeType),
    ("attributes", "Attributes", "Attribute", Attribute),
    ("one-ts-domains", "One TS Domains", "One TS domain", OneTSDomain),
    ("ad-groups", "AD Groups", "AD group", ADGroup),
    ("fulfillment-groups", "Fulfillment Groups", "Fulfillment group", FulfillmentTeam),
    ("alternate-approvers", "Alternate Approvers", "Alternate approver", AlternateApprover),
)

BY_SLUG = {slug: {"slug": slug, "label": label, "singular": singular, "model": model} for slug, label, singular, model in RECORDS}


def editable_field_names(model):
    names = []
    for field in model._meta.fields:
        if field.primary_key or not field.editable or field.name in SKIP_FIELDS:
            continue
        names.append(field.name)
    return names


def record_spec(slug):
    spec = BY_SLUG.get(slug)
    if spec is None:
        from django.http import Http404
        raise Http404("Unknown Marketplace record.")
    return spec


class RecordPageMixin(AdminAccessMixin):
    def dispatch(self, request, *args, **kwargs):
        self.spec = record_spec(kwargs["slug"])
        self.model = self.spec["model"]
        action = getattr(self, "permission_action", "view")
        self.permission_required = f"marketplace.{action}_{self.model._meta.model_name}"
        if self.model is Badge and action in {"change", "delete"} and kwargs.get("pk"):
            from apps.marketplace.system_badges import user_is_superadmin
            badge = Badge.objects.filter(pk=kwargs["pk"]).only("is_system").first()
            if badge is not None and badge.is_system and not user_is_superadmin(request.user):
                messages.error(request, "System badges can only be edited or deleted by a superadmin.")
                return redirect("marketplace_admin:record_detail", slug=self.spec["slug"], pk=kwargs["pk"])
        return super().dispatch(request, *args, **kwargs)

    def get_template_names(self):
        return [f"gdx_admin/pages/marketplace/records/{self.spec['slug']}/{self.template_kind}.html"]

    def page_context(self, **extra):
        count = extra.get("count")
        context = {
            "record_slug": self.spec["slug"],
            "record_label": self.spec["label"],
            "record_singular": self.spec["singular"],
            "staff_page_kicker": "MARKETPLACE",
            "staff_page_title": self.spec["label"],
            "staff_page_description": f"Open a {self.spec['singular'].lower()} to edit or delete it.",
            "staff_page_icon": "▦",
            "staff_page_heading": self.spec["label"],
            "staff_page_heading_text": f"Open a {self.spec['singular'].lower()} to edit or delete it.",
            "record_mutable": True,
        }
        if count is not None:
            context["staff_page_metric_label"] = "Records"
            context["staff_page_metric_value"] = count
            context["staff_page_metric_caption"] = self.spec["label"]
        context.update(extra)
        return context


class RecordListView(RecordPageMixin, ListView):
    template_kind = "list"
    context_object_name = "records"
    paginate_by = 25

    def get_queryset(self):
        model = self.model
        related = [field.name for field in model._meta.fields if field.is_relation and field.many_to_one]
        qs = model.objects.select_related(*related) if related else model.objects.all()
        names = {field.name for field in model._meta.fields}
        if "name" in names:
            qs = qs.order_by("name")
        elif "updated_at" in names:
            qs = qs.order_by("-updated_at")
        q = self.request.GET.get("q", "").strip()
        if q:
            expression = Q()
            for field in model._meta.fields:
                if field.get_internal_type() in {"CharField", "TextField", "EmailField", "SlugField"}:
                    expression |= Q(**{f"{field.name}__icontains": q})
            if expression:
                qs = qs.filter(expression)
        active = self.request.GET.get("active", "")
        if "is_active" in names and active == "active":
            qs = qs.filter(is_active=True)
        elif "is_active" in names and active == "inactive":
            qs = qs.filter(is_active=False)
        status = self.request.GET.get("status", "").strip()
        if status and "status" in names:
            qs = qs.filter(status=status)
        domain = self.request.GET.get("domain", "").strip()
        if domain.isdigit() and "domain" in names:
            qs = qs.filter(domain_id=domain)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        fields = {field.name: field for field in self.model._meta.fields}
        status_field = fields.get("status")
        status_choices = list(status_field.flatchoices) if status_field is not None and status_field.choices else []
        domain_field = fields.get("domain")
        filter_domains = []
        if domain_field is not None and domain_field.is_relation:
            filter_domains = domain_field.related_model.objects.order_by("name")
        context.update(self.page_context(
            count=context["paginator"].count if context.get("paginator") else len(context["records"]),
            show_active="is_active" in fields,
            show_status="status" in fields,
            status_choices=status_choices,
            filter_domains=filter_domains,
        ))
        return context


class RecordDetailView(RecordPageMixin, DetailView):
    template_kind = "detail"
    context_object_name = "record"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        images = []
        facts = []
        for field in self.model._meta.fields:
            if field.primary_key:
                continue
            value = getattr(self.object, field.name)
            if field.get_internal_type() in {"FileField", "ImageField"}:
                if value and getattr(value, "name", "") and value.name != "default.jpg":
                    images.append({"label": field.verbose_name, "url": value.url})
                continue
            if field.name == "image" and isinstance(value, str) and value:
                from django.templatetags.static import static
                images.append({"label": field.verbose_name, "url": static(value)})
                continue
            if field.name == "is_active":
                facts.append({"kind": "badge", "label": field.verbose_name, "value": "Active" if value else "Inactive"})
                continue
            if field.name == "status" or field.name.endswith("_status"):
                display = getattr(self.object, f"get_{field.name}_display", lambda: value)()
                facts.append({"kind": "badge", "label": field.verbose_name, "value": display or "—"})
                continue
            if getattr(field, "is_relation", False) and value is not None:
                shown = str(value)
            elif value in (None, ""):
                shown = "—"
            else:
                shown = value
            facts.append({"kind": "text", "label": field.verbose_name, "value": shown})
        from apps.marketplace.system_badges import user_is_superadmin
        record_mutable = not (getattr(self.object, "is_system", False) and not user_is_superadmin(self.request.user))
        context.update(self.page_context(
            facts=facts,
            images=images,
            record_mutable=record_mutable,
            staff_page_title=str(self.object),
            staff_page_heading=str(self.object),
            staff_page_description=self.spec["singular"],
            staff_page_heading_text=self.spec["singular"],
            staff_page_metric_label="Record",
            staff_page_metric_value=self.object.pk,
            staff_page_metric_caption=self.spec["label"],
        ))
        return context


class RecordFormMixin(RecordPageMixin):
    template_kind = "form"

    def get_form_class(self):
        return modelform_factory(self.model, fields=editable_field_names(self.model))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        title = f"Edit {self.spec['singular'].lower()}" if getattr(self, "object", None) and self.object.pk else f"New {self.spec['singular'].lower()}"
        names = set(editable_field_names(self.model))
        has_files = any(
            field.name in names and field.get_internal_type() in {"FileField", "ImageField"}
            for field in self.model._meta.fields
        )
        context.update(self.page_context(
            has_files=has_files,
            staff_page_title=title,
            staff_page_heading=title,
            staff_page_description=self.spec["label"],
            staff_page_heading_text=self.spec["label"],
        ))
        return context

    def form_valid(self, form):
        record = form.save(commit=False)
        if hasattr(record, "created_by_id") and not record.created_by_id:
            record.created_by = self.request.user
        if hasattr(record, "updated_by_id"):
            record.updated_by = self.request.user
        try:
            record.save()
        except ValidationError as exc:
            form.add_error(None, exc)
            return self.form_invalid(form)
        messages.success(self.request, f"{self.spec['singular']} saved.")
        return redirect("marketplace_admin:record_detail", slug=self.spec["slug"], pk=record.pk)

    def form_invalid(self, form):
        if self.model is Badge:
            for error in form.errors.get("name", []):
                messages.warning(self.request, error)
        return super().form_invalid(form)


class RecordCreateView(RecordFormMixin, CreateView):
    permission_action = "add"


class RecordUpdateView(RecordFormMixin, UpdateView):
    permission_action = "change"


class RecordDeleteView(RecordPageMixin, DeleteView):
    template_kind = "delete"
    context_object_name = "record"
    permission_action = "delete"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.page_context(
            staff_page_title=f"Delete {self.object}",
            staff_page_heading=f"Delete {self.object}",
            staff_page_description=self.spec["label"],
            staff_page_heading_text="This removes the record.",
        ))
        return context

    def form_valid(self, form):
        try:
            response = super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, f"{self.spec['singular']} is still used by another record.")
            return redirect("marketplace_admin:record_detail", slug=self.spec["slug"], pk=self.object.pk)
        messages.success(self.request, f"{self.spec['singular']} deleted.")
        return response

    def get_success_url(self):
        return reverse("marketplace_admin:record_list", kwargs={"slug": self.spec["slug"]})
