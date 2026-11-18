from django import forms
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models.deletion import ProtectedError
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render

from apps.resources.models import Brand, Document, Homepage, Media, Policie, Processe
from apps.third_party_apis.modules.blog_news.models import NewsPost
from apps.third_party_apis.modules.campaign_page.models import CampaignAd
from apps.third_party_apis.modules.faqs.models import Faq, FaqSection
from apps.third_party_apis.modules.hackathon.models import (
    HackathonClip,
    HackathonGalleryItem,
    HackathonLink,
    HackathonLogo,
    HackathonPage,
    HackathonScore,
    HackathonSection,
    HackathonTag,
)
from apps.third_party_apis.modules.internal_teams.models import TeamMember, TeamPage
from apps.third_party_apis.modules.roadmap.models import RoadmapMilestone, RoadmapPage
from apps.third_party_apis.modules.support_help_platform.models import (
    SupportArticle,
    SupportCategory,
    SupportPrompt,
)
from apps.third_party_apis.modules.whats_new.models import WalkthroughChrome, WalkthroughStep

EXCLUDE = {
    "id",
    "created_by",
    "created_at",
    "updated_by",
    "updated_at",
    "archived_by",
    "archived_at",
}


class Collection:
    def __init__(self, key, title, model, columns, ordering=None):
        self.key = key
        self.title = title
        self.model = model
        self.columns = columns
        self.ordering = ordering


def _columns(*names):
    labels = {
        "title": "Title",
        "name": "Name",
        "role": "Role",
        "kind": "Kind",
        "label": "Label",
        "question": "Question",
        "source_id": "Id",
        "slug": "Slug",
        "category": "Category",
        "section": "Section",
        "layout": "Layout",
        "position": "Position",
        "is_active": "Status",
        "published_on": "Published",
        "fiscal_start_year": "Fiscal year",
        "quarter": "Quarter",
        "year": "Year",
        "key": "Key",
    }
    return tuple((labels.get(name, name.replace("_", " ").title()), name) for name in names)


COLLECTIONS = {
    item.key: item
    for item in (
        Collection("leadership-page", "Team page", TeamPage, _columns("title", "is_active")),
        Collection("leadership-members", "Members", TeamMember, _columns("name", "role", "position", "is_active")),
        Collection("roadmap-page", "Roadmap page", RoadmapPage, _columns("title", "is_active")),
        Collection(
            "roadmap-milestones",
            "Milestones",
            RoadmapMilestone,
            _columns("fiscal_start_year", "quarter", "title", "is_active"),
            ordering=("-fiscal_start_year", "-quarter", "-position", "-id"),
        ),
        Collection("hackathon-page", "Hackathon page", HackathonPage, _columns("year", "title", "is_active")),
        Collection("hackathon-sections", "Sections", HackathonSection, _columns("key", "title", "position", "is_active")),
        Collection("hackathon-logos", "Logos", HackathonLogo, _columns("placement", "name", "position", "is_active")),
        Collection("hackathon-links", "Links", HackathonLink, _columns("section", "label", "position", "is_active")),
        Collection("hackathon-scores", "Scores", HackathonScore, _columns("label", "value", "position", "is_active")),
        Collection("hackathon-tags", "Groups and partners", HackathonTag, _columns("kind", "label", "position", "is_active")),
        Collection("hackathon-gallery", "Gallery", HackathonGalleryItem, _columns("label", "position", "is_active")),
        Collection("hackathon-clips", "Videos", HackathonClip, _columns("title", "position", "is_active")),
        Collection("campaign-ads", "Campaign ads", CampaignAd, _columns("kind", "title", "position", "is_active")),
        Collection("newsroom-posts", "Posts", NewsPost, _columns("title", "category", "published_on", "is_active")),
        Collection("resources-library", "Library intro", Homepage, _columns("title", "is_active")),
        Collection("resources-documents", "Documents", Document, _columns("name", "file_format", "is_active")),
        Collection("resources-policies", "Policies", Policie, _columns("name", "file_format", "is_active")),
        Collection("resources-processes", "Processes", Processe, _columns("name", "file_format", "is_active")),
        Collection("resources-brands", "Brands", Brand, _columns("name", "is_active")),
        Collection("resources-media", "Media", Media, _columns("name", "file_format", "is_active")),
        Collection("faq-sections", "Sections", FaqSection, _columns("title", "position")),
        Collection("faq-items", "Questions", Faq, _columns("section", "question", "position", "is_active")),
        Collection("support-categories", "Topics", SupportCategory, _columns("label", "position")),
        Collection("support-articles", "Articles", SupportArticle, _columns("title", "category", "position", "is_active")),
        Collection("support-prompts", "Prompts", SupportPrompt, _columns("question", "position", "is_active")),
        Collection("whats-new-steps", "Steps", WalkthroughStep, _columns("title", "position", "is_active")),
        Collection("whats-new-chrome", "Menu hotspots", WalkthroughChrome, _columns("layout",)),
    )
}

HUBS = {
    "leadership": ("Leadership", ("leadership-page", "leadership-members")),
    "roadmap": ("Roadmap", ("roadmap-page", "roadmap-milestones")),
    "hackathon": ("Hackathon", (
        "hackathon-page", "hackathon-sections", "hackathon-logos", "hackathon-links",
        "hackathon-scores", "hackathon-tags", "hackathon-gallery", "hackathon-clips",
    )),
    "campaign": ("Campaign", ("campaign-ads",)),
    "newsroom": ("Newsroom", ("newsroom-posts",)),
    "resources": ("Resources", (
        "resources-library", "resources-documents", "resources-policies",
        "resources-processes", "resources-brands", "resources-media",
    )),
    "faqs": ("FAQs", ("faq-sections", "faq-items")),
    "support": ("Support", ("support-categories", "support-articles", "support-prompts")),
    "whats-new": ("What's New", ("whats-new-steps", "whats-new-chrome")),
}


def _stored_values(model, name):
    values = []
    if name not in {field.name for field in model._meta.fields}:
        return values
    for value in model.objects.order_by(name).values_list(name, flat=True).distinct():
        if hasattr(value, "name"):
            value = value.name
        if value and value not in values:
            values.append(value)
    return values


def _choice_field(choices, initial, required=True):
    pairs = []
    for value in choices:
        label = value[1] if isinstance(value, tuple) else value
        stored = value[0] if isinstance(value, tuple) else value
        if stored not in {item[0] for item in pairs}:
            pairs.append((stored, label))
    field = forms.ChoiceField(choices=pairs, initial=initial, required=required)
    field.widget.attrs["class"] = "form-control"
    return field


def _with_current(choices, current):
    values = list(choices)
    if current and current not in values and (current, current) not in values:
        values.append(current)
    return values


def _known_choices(form, model):
    current = form.instance if form.instance.pk else None

    def value_of(name):
        if current is None:
            return ""
        value = getattr(current, name, "")
        return value.name if hasattr(value, "name") else (value or "")

    if "classification" in form.fields:
        stored = _stored_values(model, "classification")
        choices = _with_current(["Protected", *stored], value_of("classification"))
        form.fields["classification"] = _choice_field(choices, value_of("classification") or "Protected")
    if "file_format" in form.fields:
        preferred = ["MP4", "WEBM"] if model.__name__ == "Media" else ["PDF", "JSON", "Web"]
        stored = _stored_values(model, "file_format")
        choices = _with_current([*preferred, *stored], value_of("file_format"))
        initial = value_of("file_format") or ("MP4" if model.__name__ == "Media" else "PDF")
        form.fields["file_format"] = _choice_field(choices, initial)
    if model.__name__ == "Brand" and "desc" in form.fields:
        choices = [
            ("dark", "Intended for use on dark backgrounds"),
            ("light", "Intended for use on light backgrounds"),
        ]
        initial = "dark"
        current_desc = value_of("desc")
        if "light backgrounds" in current_desc:
            initial = "light"
        elif current_desc and "dark backgrounds" not in current_desc:
            choices.append((current_desc, current_desc))
            initial = current_desc
        form.fields["desc"] = _choice_field(choices, initial)
    path_fields = {
        "cover": ["assets/resources/thumbnails/protected.svg"],
        "platform": ["assets/images/icons/tools/adobe-pdf.svg"],
        "icon": [
            "assets/images/icons/tools/720p.svg",
            "assets/images/icons/tools/1080p.svg",
        ],
    }
    for name, preferred in path_fields.items():
        if name not in form.fields:
            continue
        current_path = value_of(name)
        if current_path in {"", "default.svg", "default.jpg", "default.mp4"}:
            current_path = ""
        choices = _with_current([*preferred, *_stored_values(model, name)], current_path)
        choices = [item for item in choices if item not in {"default.svg", "default.jpg", "default.mp4"}]
        form.fields[name] = _choice_field(choices, current_path or preferred[0])
    if not form.instance.pk and "is_active" in form.fields:
        form.fields["is_active"].initial = True
    if not form.instance.pk and model.__name__ == "Document" and "view_url" in form.fields:
        form.fields["view_url"].initial = "/docs/protected/"
    if model.__name__ in {"Brand", "Media", "Document", "Policie", "Processe"} and "download_url" in form.fields:
        form.fields["download_url"].required = False
        form.fields["download_url"].disabled = True
    if model.__name__ in {"Brand", "Media", "Document", "Policie", "Processe"} and "size" in form.fields:
        form.fields["size"].required = False
        form.fields["size"].disabled = True
    if model.__name__ in {"Document", "Policie", "Processe"}:
        from collections import OrderedDict

        from apps.resources.validators import validate_document_upload

        section = {"Document": "document", "Policie": "policy", "Processe": "process"}[model.__name__]
        falls_under = _choice_field(
            [("document", "Document"), ("policy", "Policy"), ("process", "Process")],
            section,
        )
        falls_under.label = "Falls under"
        form.fields["source_file"] = forms.FileField(
            label="File",
            required=False,
            validators=[validate_document_upload],
        )
        form.fields["source_file"].widget.attrs["class"] = "form-control"
        ordered = OrderedDict()
        ordered["falls_under"] = falls_under
        ordered.update(form.fields)
        form.fields = ordered
    _lock_timestamps(form)
    if not form.instance.pk and model.__name__ == "Media" and "date" in form.fields:
        from django.utils import timezone

        form.fields["date"].initial = timezone.localtime()


def _lock_timestamps(form):
    from django.utils import timezone

    for name, label in (("publish_at", "Publish at"), ("expire_at", "Expired at")):
        field = form.fields.get(name)
        if field is None:
            continue
        field.label = label
        field.required = False
        field.disabled = True
        field.widget = forms.DateTimeInput(
            attrs={"type": "datetime-local", "class": "form-control"},
            format="%Y-%m-%dT%H:%M",
        )
        value = getattr(form.instance, name, None) if form.instance.pk else None
        if name == "publish_at" and value is None and not form.instance.pk:
            value = timezone.localtime()
        if value is not None and timezone.is_aware(value):
            value = timezone.localtime(value)
        if value is not None:
            field.initial = value


def _format_size(num_bytes):
    if not num_bytes:
        return "0KB"
    if num_bytes >= 1024 * 1024:
        text = f"{num_bytes / (1024 * 1024):.1f}MB"
    else:
        text = f"{max(1, round(num_bytes / 1024))}KB"
    return text[:10]


def _download_url(request, stored_name):
    from urllib.parse import quote
    from django.conf import settings

    filename = stored_name.rsplit("/", 1)[-1]
    directory = stored_name.rsplit("/", 1)[0] if "/" in stored_name else ""
    prefix = settings.MEDIA_URL if settings.MEDIA_URL.endswith("/") else f"{settings.MEDIA_URL}/"
    path = f"{prefix}{directory}/{quote(filename)}" if directory else f"{prefix}{quote(filename)}"
    return request.build_absolute_uri(path)


_FORMATS = {
    ".pdf": "PDF",
    ".json": "JSON",
    ".mp4": "MP4",
    ".webm": "WEBM",
    ".svg": "SVG",
    ".png": "PNG",
    ".jpg": "JPG",
    ".jpeg": "JPG",
    ".webp": "WEBP",
    ".doc": "DOC",
    ".docx": "DOCX",
}


def _store_source_file(obj, upload):
    from django.core.files.storage import default_storage

    folders = {
        "Document": "marketplace/resources/docs/files",
        "Policie": "marketplace/resources/policies/files",
        "Processe": "marketplace/resources/processes/files",
    }
    folder = folders.get(obj.__class__.__name__, "marketplace/resources/docs/files")
    return default_storage.save(f"{folder}/{upload.name}", upload)


def _place_in_section(obj, section):
    from apps.resources.models import Document, Policie, Processe

    target = {"document": Document, "policy": Policie, "process": Processe}.get(section)
    if target is None or isinstance(obj, target):
        return obj, False
    placed = target()
    for name in (
        "name", "classification", "size", "file_format", "desc", "view_url",
        "download_url", "is_active", "is_archived", "publish_at", "expire_at",
        "cover", "platform", "created_by", "updated_by",
    ):
        if hasattr(placed, name) and hasattr(obj, name):
            setattr(placed, name, getattr(obj, name))
    if hasattr(placed, "external_url"):
        placed.external_url = getattr(obj, "external_url", "") or obj.view_url or ""
    if isinstance(placed, Document):
        placed.resource_kind = Document.ResourceKind.DOCUMENT
    return placed, True


def _stamp_publication(obj):
    from django.utils import timezone

    now = timezone.now()
    if hasattr(obj, "publish_at") and getattr(obj, "is_active", False) and not obj.publish_at:
        obj.publish_at = now
    if not hasattr(obj, "expire_at"):
        return
    if getattr(obj, "is_archived", False):
        if not obj.expire_at:
            obj.expire_at = now
    else:
        obj.expire_at = None


def form_for(model):
    meta_model = model
    excluded = tuple(name for name in EXCLUDE if name in {field.name for field in meta_model._meta.fields})

    class RecordForm(forms.ModelForm):
        class Meta:
            model = meta_model
            exclude = excluded

        def _get_validation_exclusions(self):
            exclude = super()._get_validation_exclusions()
            for name in ("cover", "platform", "icon"):
                if isinstance(self.fields.get(name), forms.ChoiceField):
                    exclude.add(name)
            return exclude

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            for field in self.fields.values():
                if isinstance(field.widget, forms.CheckboxInput):
                    field.widget.attrs["class"] = "form-check-input"
                else:
                    field.widget.attrs["class"] = "form-control"
                if isinstance(field, forms.JSONField):
                    field.widget.attrs["rows"] = 8
                field.validators = [
                    validator for validator in field.validators
                    if getattr(validator, "__name__", "") != "validate_resource_url"
                ]
            _known_choices(self, meta_model)

        def clean(self):
            cleaned = super().clean()
            section = cleaned.get("falls_under")
            if not self.instance.pk and section in {"document", "process"} and not cleaned.get("source_file"):
                self.add_error("source_file", "Upload the file for this document.")
            return cleaned

    RecordForm.__name__ = f"{model.__name__}Form"
    return RecordForm


def _collection(key):
    collection = COLLECTIONS.get(key)
    if collection is None:
        raise Http404
    return collection


def _page(context, heading, parent):
    context["heading"] = heading
    context["heading2"] = heading
    context["pageview"] = parent or "Pages"
    return context


def _cell(obj, name):
    value = getattr(obj, name)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


@login_required
def site_manage(request, key):
    if key in HUBS:
        title, keys = HUBS[key]
        groups = []
        for item_key in keys:
            collection = COLLECTIONS[item_key]
            groups.append({"collection": collection, "count": collection.model.objects.count()})
        return render(request, "gdx_users/apps/pages/manage_hub.html", _page({
            "title": title,
            "groups": groups,
            "reader_slug": key,
        }, title, "Pages"))
    collection = _collection(key)
    rows = []
    records = collection.model.objects.all()
    if collection.ordering:
        records = records.order_by(*collection.ordering)
    for obj in records:
        rows.append({
            "object": obj,
            "cells": [_cell(obj, name) for _, name in collection.columns],
        })
    return render(request, "gdx_users/apps/pages/manage_list.html", _page({
        "collection": collection,
        "rows": rows,
    }, collection.title, "Pages"))


@login_required
def site_record_form(request, key, pk=None):
    collection = _collection(key)
    instance = get_object_or_404(collection.model, pk=pk) if pk else None
    form = form_for(collection.model)(request.POST or None, request.FILES or None, instance=instance)
    if request.method == "POST" and form.is_valid():
        obj = form.save(commit=False)
        section = form.cleaned_data.get("falls_under")
        obj, moved = _place_in_section(obj, section) if section else (obj, False)
        if collection.model.__name__ == "Brand" and obj.desc in {"dark", "light"}:
            surface = "dark" if obj.desc == "dark" else "light"
            obj.desc = f"{obj.name} is intended for use on {surface} backgrounds."
        upload = (
            form.cleaned_data.get("source_file")
            or request.FILES.get("image")
            or request.FILES.get("media")
        )
        stored_name = _store_source_file(obj, upload) if form.cleaned_data.get("source_file") else ""
        if stored_name and hasattr(obj, "download_url"):
            obj.download_url = _download_url(request, stored_name)
        if upload is not None and hasattr(obj, "size"):
            obj.size = _format_size(upload.size)
        if upload is not None and hasattr(obj, "file_format"):
            suffix = f".{upload.name.rsplit('.', 1)[-1].lower()}" if "." in upload.name else ""
            if suffix in _FORMATS:
                obj.file_format = _FORMATS[suffix]
        _stamp_publication(obj)
        if getattr(obj, "updated_by_id", None) is not None or hasattr(obj, "updated_by"):
            if "updated_by" in {field.name for field in obj._meta.fields}:
                obj.updated_by = request.user
        if instance is None and "created_by" in {field.name for field in obj._meta.fields}:
            obj.created_by = request.user
        if hasattr(obj, "download_url") and not obj.download_url:
            obj.download_url = getattr(obj, "view_url", "") or getattr(obj, "external_url", "") or "/"
        if hasattr(obj, "external_url") and not obj.external_url:
            obj.external_url = obj.view_url or obj.download_url or "/"
        obj.save()
        if moved and instance is not None and instance.pk and not isinstance(instance, obj.__class__):
            instance.delete()
        if not stored_name and upload is not None and hasattr(obj, "download_url"):
            stored = obj.image if "image" in request.FILES else obj.media
            if getattr(stored, "name", ""):
                obj.download_url = _download_url(request, stored.name)
                obj.save(update_fields=["download_url"])
        if not moved:
            form.save_m2m()
        messages.success(request, f"{collection.title} saved.")
        saved_key = {
            "Document": "resources-documents",
            "Policie": "resources-policies",
            "Processe": "resources-processes",
        }.get(obj.__class__.__name__, key)
        return redirect("pages_staff:site-manage", key=saved_key)
    create_headings = {
        "resources-brands": "Add image",
        "resources-media": "Add video",
    }
    heading = f"Edit {instance}" if instance else create_headings.get(
        key,
        f"Add {collection.title[:-1] if collection.title.endswith('s') else collection.title}",
    )
    return render(request, "gdx_users/apps/pages/manage_form.html", _page({
        "collection": collection,
        "form": form,
        "object": instance,
    }, heading, collection.title))


@login_required
def site_record_delete(request, key, pk):
    collection = _collection(key)
    obj = get_object_or_404(collection.model, pk=pk)
    if request.method == "POST":
        try:
            obj.delete()
        except ProtectedError:
            messages.error(request, "This record is still used by another record and cannot be deleted.")
            return redirect("pages_staff:site-manage", key=key)
        messages.success(request, f"{obj} deleted.")
        return redirect("pages_staff:site-manage", key=key)
    return render(request, "gdx_users/apps/pages/manage_delete.html", _page({
        "collection": collection,
        "object": obj,
    }, f"Delete {obj}", collection.title))
