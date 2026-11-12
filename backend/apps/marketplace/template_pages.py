from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.urls import reverse
from django.utils.html import escape
from django.views.generic import TemplateView


_STATUS_BADGES = {
    "draft": "badge-soft-primary me-2 badge badge-soft-primary-custom",
    "approved": "badge-soft-success me-1 badge badge-soft-success-custom",
    "active": "badge-soft-success me-1 badge badge-soft-success-custom",
    "pending": "badge-soft-info me-1 badge badge-soft-info-custom",
    "archived": "badge-soft-dark me-1 badge badge-soft-dark-custom",
    "inactive": "badge-soft-dark me-1 badge badge-soft-dark-custom",
    "discontinued": "badge-soft-danger me-1 badge badge-soft-danger-custom",
    "rejected": "badge-soft-danger me-1 badge badge-soft-danger-custom",
}


def _status(record):
    if hasattr(record, "status") and record.status:
        key = str(record.status).lower()
        label = record.get_status_display() if hasattr(record, "get_status_display") else record.status
    else:
        key = "active" if getattr(record, "is_active", False) else "inactive"
        label = "Active" if key == "active" else "Inactive"
    css = _STATUS_BADGES.get(key, "badge bg-secondary text-white")
    return (
        f'<span class="{css}" style="font-size: 12px !important; padding: 4px 12px !important;">'
        f"{escape(label)}</span>"
    )


def _text(value):
    return escape(value or "")


def _image(file_field, alt, wide=False):
    name = getattr(file_field, "name", "") if file_field is not None else ""
    if not name or name == "default.jpg":
        return ""
    storage = getattr(file_field, "storage", None)
    if storage is not None and not storage.exists(name):
        return ""
    try:
        url = file_field.url
    except ValueError:
        return ""
    size = "width:80px;height:48px;" if wide else "width:40px;height:40px;"
    return (
        f'<img src="{escape(url)}" alt="{escape(alt or "")}" class="rounded" '
        f'style="{size}object-fit:cover;">'
    )


def _product_image(record):
    for item in record.images.all():
        markup = _image(item.image, record.name)
        if markup:
            return markup
    return ""


def _badge_image(record):
    image = (getattr(record, "image", "") or "").strip()
    if not record.is_system or not image:
        return ""
    filename = image.rsplit("/", 1)[-1]
    if not filename:
        return ""
    url = reverse("marketplace:system-badge-image", kwargs={"filename": filename})
    return (
        f'<img src="{escape(url)}" alt="{escape(record.name or "")}" class="rounded" '
        f'style="width:40px;height:40px;object-fit:contain;">'
    )


def _yes_no(value):
    if value is True:
        return "Yes"
    if value is False:
        return "No"
    return "—"


def _review_actions(pk):
    workflow = reverse("marketplace:review-workflow", kwargs={"pk": pk})
    icon = (
        f'<a href="{workflow}" title="Workflow">'
        f'<i class="bx bx-git-branch align-bottom" style="font-size: 20px;"></i></a>'
    )
    return _actions("review", pk).replace("</div>", icon + "</div>")


def _actions(prefix, pk):
    detail = reverse(f"marketplace:{prefix}-detail", kwargs={"pk": pk})
    edit = reverse(f"marketplace:{prefix}-edit", kwargs={"pk": pk})
    delete = reverse(f"marketplace:{prefix}-delete", kwargs={"pk": pk})
    return (
        '<div class="d-flex gap-2 justify-content-center align-items-center">'
        f'<a href="{detail}" title="View"><i class="bx bx-show align-bottom" style="font-size: 20px;"></i></a>'
        f'<a href="{edit}" title="Edit"><i class="bx bxs-edit-alt align-bottom text-primary" style="font-size: 20px; line-height: 2;"></i></a>'
        f'<a href="{delete}" title="Delete"><i class="bx bx-trash align-bottom text-danger" style="font-size: 20px;"></i></a>'
        "</div>"
    )


class MarketplaceTemplatePage(LoginRequiredMixin, TemplateView):
    page_title = "Marketplace"
    context_key = ""
    count_key = ""
    record_model = None
    row_kind = ""
    search_fields = ()
    select_related = ()

    def get(self, request, *args, **kwargs):
        if "draw" in request.GET:
            return self.table_response()
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        records = self.queryset()
        context.update(
            {
                "heading": self.page_title,
                "heading2": self.page_title,
                "pageview": "Marketplace",
                "current_per_page": 25,
                "is_super_admin": user.is_superuser,
                "is_content_manager": user.is_superuser
                or user.groups.filter(name__in=["Content Manager Group", "Web Publishers Group"]).exists(),
            }
        )
        if self.context_key:
            context[self.context_key] = records
        if self.count_key:
            context[self.count_key] = records.count() if self.record_model is not None else 0
        if self.row_kind == "product":
            from apps.marketplace.models import Datatype

            context["datatypes"] = Datatype.objects.order_by("name")
        if self.row_kind == "review" and self.record_model is not None:
            base = self.record_model.objects.all()
            context["review_counts"] = {
                "total": base.count(),
                "pending": base.filter(status="pending").count(),
                "approved": base.filter(status="approved").count(),
                "rejected": base.filter(status="rejected").count(),
            }
        return context

    def queryset(self):
        if self.record_model is None:
            return []
        records = self.record_model.objects.all()
        if self.select_related:
            records = records.select_related(*self.select_related)
        if self.row_kind == "product":
            records = records.prefetch_related("images")
        query = (self.request.GET.get("q") or "").strip()
        if query and self.search_fields:
            lookup = Q()
            for field in self.search_fields:
                lookup |= Q(**{f"{field}__icontains": query})
            records = records.filter(lookup)
        status = (self.request.GET.get("status") or "").strip()
        if self.row_kind == "product":
            records = records.hide_archived(status)
        if status and status != "all" and self.record_model is not None:
            field_names = {field.name for field in self.record_model._meta.fields}
            if "status" in field_names and status not in {"active", "inactive"}:
                records = records.filter(status=status)
            elif status in {"approved", "active"}:
                records = records.filter(is_active=True)
            elif status in {"draft", "archived", "discontinued", "pending", "inactive"}:
                records = records.filter(is_active=False)
        datatype = (self.request.GET.get("type") or "").strip()
        if datatype and datatype != "all" and self.row_kind == "product":
            records = records.filter(datatype__name=datatype)
        if self.row_kind == "review":
            return records.order_by("-created_at", "-id")
        return records.order_by("id")

    def table_response(self):
        draw = int(self.request.GET.get("draw") or 1)
        start = int(self.request.GET.get("start") or 0)
        length = int(self.request.GET.get("length") or 25)
        records = self.queryset()
        total = records.count()
        page = records[start:start + length]
        return JsonResponse(
            {
                "draw": draw,
                "recordsTotal": total,
                "recordsFiltered": total,
                "data": [self.row(record) for record in page],
            }
        )

    def row(self, record):
        kind = self.row_kind
        if kind == "domain":
            return {
                "id": record.id,
                "image": _image(record.image, record.name, wide=True),
                "domain": _text(record.name),
                "level": record.level if record.level is not None else "",
                "status": _status(record),
                "actions": _actions("domain", record.pk),
            }
        if kind == "subdomain1":
            return {
                "id": record.id,
                "image": _image(record.image, record.name, wide=True),
                "subdomain": _text(record.name),
                "domain": _text(record.domain.name if record.domain_id else ""),
                "level": record.level if record.level is not None else "",
                "status": _status(record),
                "actions": _actions("subdomain1", record.pk),
            }
        if kind == "subdomain2":
            parent = record.subdomain_1
            return {
                "id": record.id,
                "image": _image(record.image, record.name, wide=True),
                "subdomain": _text(record.name),
                "domain": _text(parent.domain.name if parent and parent.domain_id else ""),
                "subdomain_1": _text(parent.name if parent else ""),
                "level": record.level if record.level is not None else "",
                "status": _status(record),
                "actions": _actions("subdomain2", record.pk),
            }
        if kind == "product":
            return {
                "id": record.id,
                "image": _product_image(record),
                "products": _text(record.name),
                "data_steward": _text(record.data_steward.name if record.data_steward_id else ""),
                "domains": _text(record.domain.name if record.domain_id else ""),
                "datatypes": _text(record.datatype.name if record.datatype_id else ""),
                "status": _status(record),
                "actions": _actions("product", record.pk),
            }
        if kind == "review":
            return {
                "id": record.id,
                "title": _text(record.title),
                "rating": record.rating if record.rating is not None else "",
                "recommend": _yes_no(record.would_recommend),
                "expectations": _yes_no(record.met_expectations),
                "status": _status(record),
                "created": record.created_at.strftime("%d %B, %Y") if record.created_at else "",
                "actions": _review_actions(record.pk),
            }
        if kind == "badge":
            return {
                "id": record.id,
                "image": _badge_image(record),
                "name": _text(record.name),
                "status": _status(record),
                "actions": _actions("badge", record.pk),
            }
        if kind == "onets":
            return {
                "id": record.id,
                "name": _text(record.name),
                "control_group": _text(record.control_group),
                "group_name": _text(record.group_name),
                "data_steward": _text(record.data_steward.name if record.data_steward_id else ""),
                "status": _status(record),
                "actions": _actions("onetsdomain", record.pk),
            }
        if kind == "steward":
            return {
                "id": record.id,
                "image": _image(record.avatar, record.name),
                "name": _text(record.name),
                "email": _text(record.email),
                "company": _text(record.company_id.name if record.company_id_id else ""),
                "status": _status(record),
                "actions": _actions("datasteward", record.pk),
            }
        if kind == "contact":
            return {
                "id": record.id,
                "image": _image(record.avatar, record.name),
                "name": _text(record.name),
                "email": _text(record.email),
                "status": _status(record),
                "actions": _actions("contact", record.pk),
            }
        payload = {
            "id": record.id,
            "name": _text(record.name),
            "status": _status(record),
            "actions": _actions(kind, record.pk),
        }
        if kind in {"classification", "datatype"}:
            payload["value"] = _text(record.value)
        return payload
