from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.forms import ClearableFileInput
from django.forms.models import modelform_factory
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views import View
from django.views.generic import CreateView, DeleteView, DetailView, UpdateView

from .models import Badge, Catalog, Domain, Review, SubDomain_1, SubDomain_2


SKIP_FIELDS = {"created_by", "created_at", "updated_by", "updated_at", "sku", "slug"}
ACTION_LABELS = {
    "domain": "Domain",
    "subdomain1": "Subdomain Level 1",
    "subdomain2": "Subdomain Level 2",
    "classification": "Classification",
    "badge": "Badge",
    "keyword": "Keyword",
    "datatype": "Datatype",
    "platform": "Platform",
    "contact": "Contact",
    "catalog": "Catalog",
    "review": "Review",
    "datasteward": "Data Steward",
    "onetsdomain": "1TS Domain",
}


def _action_label(view):
    return ACTION_LABELS.get(view.route_prefix) or view.model._meta.verbose_name.title()


def _form_has_file(form):
    if form is None:
        return False
    return any(getattr(field.field.widget, "input_type", "") == "file" for field in form)


class RecordFileInput(ClearableFileInput):
    template_name = "gdx_users/apps/marketplace/widgets/clearable_file_input.html"


def _record_form_class(model):
    skip = set(SKIP_FIELDS)
    show_slug = model in (Domain, SubDomain_1, SubDomain_2)
    if show_slug:
        skip.discard("slug")

    def callback(field, **kwargs):
        if isinstance(field, (models.FileField, models.ImageField)):
            kwargs["widget"] = RecordFileInput()
        if show_slug and field.name == "slug":
            kwargs["disabled"] = True
            kwargs["label"] = "Domain Slug"
        form_field = field.formfield(**kwargs)
        if show_slug and field.name == "slug" and form_field is not None:
            form_field.widget.attrs["readonly"] = True
        return form_field

    fields = [
        field.name
        for field in model._meta.fields
        if field.editable and not field.primary_key and field.name not in skip
    ]
    return modelform_factory(model, fields=fields, formfield_callback=callback)


def _review_product_image(review):
    product = getattr(review, "product", None)
    if product is None:
        return ""
    for item in product.images.all():
        image = item.image
        name = getattr(image, "name", "") if image is not None else ""
        if not name:
            continue
        storage = getattr(image, "storage", None)
        try:
            if storage is not None and not storage.exists(name):
                continue
            return image.url
        except ValueError:
            continue
    return ""


def _file_url(file_field):
    name = getattr(file_field, "name", "") if file_field is not None else ""
    if not name or name == "default.jpg":
        return ""
    storage = getattr(file_field, "storage", None)
    if storage is not None and not storage.exists(name):
        return ""
    try:
        return file_field.url
    except ValueError:
        return ""


class MarketplaceHtmlMixin(LoginRequiredMixin):
    route_prefix = ""
    def page_flags(self):
        user = self.request.user
        is_super_admin = user.is_superuser or user.groups.filter(name="SuperAdmin Group").exists()
        is_content_manager = is_super_admin or user.groups.filter(
            name__in=["Content Manager Group", "Web Publishers Group"]
        ).exists()
        return is_super_admin, is_content_manager

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        is_super_admin, is_content_manager = self.page_flags()
        record = getattr(self, "object", None)
        context.update(
            {
                "heading": getattr(record, "name", "") or "Marketplace",
                "heading2": "Marketplace",
                "pageview": "Marketplace",
                "is_super_admin": is_super_admin,
                "is_content_manager": is_content_manager,
                "product_count": 0,
                "subdomains": [],
                "level3_subdomains": [],
                "record_image_url": _file_url(getattr(record, "image", None)) or _file_url(getattr(record, "avatar", None)),
            }
        )
        if isinstance(record, Review):
            context["heading"] = record.title or "Review"
            context["heading2"] = context["heading"]
        if isinstance(record, Badge):
            image = (record.image or "").strip()
            filename = image.rsplit("/", 1)[-1] if record.is_system and image else ""
            if filename:
                context["record_image_url"] = reverse(
                    "marketplace:system-badge-image", kwargs={"filename": filename}
                )
        if isinstance(record, Domain):
            context["subdomains"] = record.domain.all()
            context["product_count"] = record.product_domain.count()
            child_count = record.domain.count()
            if child_count:
                context["warning"] = f"This will also delete {child_count} subdomain{'s' if child_count != 1 else ''} under it."
        elif isinstance(record, SubDomain_1):
            context["product_count"] = record.product_subdomain_2.count()
            context["level3_subdomains"] = record.subdomain_1.all()
            child_count = record.subdomain_1.count()
            if child_count:
                context["warning"] = f"This will also delete {child_count} Level 2 subdomain{'s' if child_count != 1 else ''} under it."
        elif isinstance(record, SubDomain_2):
            context["product_count"] = record.product_subdomain_3.count()
        return context


class MarketplaceDetailPage(MarketplaceHtmlMixin, DetailView):
    context_object_name = "object"


class CatalogImageUploadView(LoginRequiredMixin, View):
    def post(self, request, pk):
        catalog = get_object_or_404(Catalog, pk=pk)
        user = request.user
        allowed = user.is_superuser or user.groups.filter(
            name__in=["SuperAdmin Group", "Content Manager Group", "Web Publishers Group"]
        ).exists()
        if not allowed:
            messages.error(request, "You cannot change this catalog image.")
            return redirect("marketplace:catalog-detail", pk=pk)
        upload = request.FILES.get("image")
        if upload is None:
            messages.error(request, "Choose an image to upload.")
            return redirect("marketplace:catalog-detail", pk=pk)
        try:
            catalog.image = Catalog._meta.get_field("image").clean(upload, catalog)
        except ValidationError as exc:
            messages.error(request, " ".join(getattr(exc, "messages", []) or [str(exc)]))
            return redirect("marketplace:catalog-detail", pk=pk)
        catalog.updated_by = request.user
        catalog.save()
        messages.success(request, f"Catalog '{catalog}' image saved.")
        return redirect("marketplace:catalog-detail", pk=pk)


class MarketplaceCreatePage(MarketplaceHtmlMixin, CreateView):
    def get_form_class(self):
        return _record_form_class(self.model)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        label = _action_label(self)
        context["heading"] = f"New {label}"
        context["heading2"] = context["heading"]
        context["kicker"] = label
        context["cancel_url"] = reverse(f"marketplace:{self.route_prefix}-index")
        context["has_file_field"] = _form_has_file(context.get("form"))
        return context

    def form_valid(self, form):
        if hasattr(form.instance, "created_by_id") and not form.instance.created_by_id:
            form.instance.created_by = self.request.user
        if hasattr(form.instance, "updated_by_id"):
            form.instance.updated_by = self.request.user
        response = super().form_valid(form)
        messages.success(self.request, f"{_action_label(self)} '{self.object}' saved.")
        return response

    def form_invalid(self, form):
        messages.error(self.request, "The record was not saved. Check the form and try again.")
        return super().form_invalid(form)

    def get_success_url(self):
        return reverse(f"marketplace:{self.route_prefix}-detail", kwargs={"pk": self.object.pk})


class MarketplaceEditPage(MarketplaceHtmlMixin, UpdateView):
    context_object_name = "object"

    def get_form_class(self):
        return _record_form_class(self.model)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        label = _action_label(self)
        context["kicker"] = label
        context["heading"] = f"Edit {label}"
        context["heading2"] = context["heading"]
        context["cancel_url"] = reverse(f"marketplace:{self.route_prefix}-detail", kwargs={"pk": self.object.pk})
        context["delete_url"] = reverse(f"marketplace:{self.route_prefix}-delete", kwargs={"pk": self.object.pk})
        context["round_image"] = self.route_prefix in {"contact", "datasteward"}
        context["has_file_field"] = _form_has_file(context.get("form"))
        if isinstance(self.object, Review):
            context["product_image_url"] = _review_product_image(self.object)
        return context

    def form_valid(self, form):
        if hasattr(form.instance, "updated_by_id"):
            form.instance.updated_by = self.request.user
        response = super().form_valid(form)
        messages.success(self.request, f"{_action_label(self)} '{self.object}' updated.")
        return response

    def form_invalid(self, form):
        messages.error(self.request, "The record was not saved. Check the form and try again.")
        return super().form_invalid(form)

    def get_success_url(self):
        return reverse(f"marketplace:{self.route_prefix}-detail", kwargs={"pk": self.object.pk})


class MarketplaceDeletePage(MarketplaceHtmlMixin, DeleteView):
    context_object_name = "object"

    def form_valid(self, form):
        name = str(self.object)
        messages.success(self.request, f"{_action_label(self)} '{name}' deleted.")
        return super().form_valid(form)

    def get_success_url(self):
        return reverse(f"marketplace:{self.route_prefix}-index")
