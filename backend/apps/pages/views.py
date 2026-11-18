from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.db.models import F
from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import ContentBlockForm, ContentBlockReorderForm
from .models import ContentBlock, Page, PageVersion
from .permissions import require_version_edit, require_version_view

BASE = "gdx_admin/pages/pages/page/"

def _version(slug, number):
    return get_object_or_404(PageVersion.objects.select_related("page", "page__page_type"), page__slug=slug, number=number)

def _audit_placeholder(request, version, action, block=None):
    # Replace with the host app's immutable audit service if available.
    return None

@login_required
def block_list(request, slug, number):
    version = require_version_view(request.user, _version(slug, number))
    return render(request, BASE + "content_block_list.html", {"page": version.page, "version": version, "blocks": version.blocks.all()})

@login_required
@transaction.atomic
def block_create(request, slug, number):
    version = require_version_edit(request.user, _version(slug, number))
    initial_position = (version.blocks.order_by("-position").values_list("position", flat=True).first() or -1) + 1
    form = ContentBlockForm(request.POST or None, page_type=version.page.page_type, user=request.user, initial={"position": initial_position})
    if request.method == "POST" and form.is_valid():
        block = form.save(commit=False)
        block.version = version
        block.save()
        _audit_placeholder(request, version, "content-block-created", block)
        messages.success(request, "Content block created.")
        return redirect("pages_admin:block-list", slug=slug, number=number)
    return render(request, BASE + "content_block_form.html", {"page": version.page, "version": version, "form": form, "mode": "create"})

@login_required
@transaction.atomic
def block_edit(request, slug, number, block_id):
    version = require_version_edit(request.user, _version(slug, number))
    block = get_object_or_404(ContentBlock, pk=block_id, version=version)
    form = ContentBlockForm(request.POST or None, instance=block, page_type=version.page.page_type, user=request.user)
    if request.method == "POST" and form.is_valid():
        block = form.save()
        _audit_placeholder(request, version, "content-block-updated", block)
        messages.success(request, "Content block updated.")
        return redirect("pages_admin:block-list", slug=slug, number=number)
    return render(request, BASE + "content_block_form.html", {"page": version.page, "version": version, "block": block, "form": form, "mode": "edit"})

@login_required
@transaction.atomic
def block_delete(request, slug, number, block_id):
    version = require_version_edit(request.user, _version(slug, number))
    block = get_object_or_404(ContentBlock, pk=block_id, version=version)
    if request.method == "POST":
        deleted_position = block.position
        block.delete()
        version.blocks.filter(position__gt=deleted_position).update(position=F("position") - 1)
        _audit_placeholder(request, version, "content-block-deleted")
        messages.success(request, "Content block deleted.")
        return redirect("pages_admin:block-list", slug=slug, number=number)
    return render(request, BASE + "content_block_confirm_delete.html", {"page": version.page, "version": version, "block": block})

@login_required
@require_POST
@transaction.atomic
def block_reorder(request, slug, number):
    version = require_version_edit(request.user, _version(slug, number))
    form = ContentBlockReorderForm(request.POST, version=version)
    if not form.is_valid():
        messages.error(request, "The block order could not be saved.")
        return redirect("pages_admin:block-list", slug=slug, number=number)
    blocks = {str(block.pk): block for block in version.blocks.select_for_update()}
    # Temporary high positions avoid the unique version+position constraint while reordering.
    for offset, block_id in enumerate(form.cleaned_data["ordered_ids"], start=1):
        ContentBlock.objects.filter(pk=blocks[block_id].pk).update(position=1_000_000 + offset)
    for position, block_id in enumerate(form.cleaned_data["ordered_ids"]):
        ContentBlock.objects.filter(pk=blocks[block_id].pk).update(position=position)
    _audit_placeholder(request, version, "content-blocks-reordered")
    messages.success(request, "Content blocks reordered.")
    return redirect("pages_admin:block-list", slug=slug, number=number)
from .forms import PageTypeForm,PageForm,VersionForm,DecisionForm,LifecycleRequestForm
from .models import PageType,WorkflowTask,Approval,AuditEvent,NotificationDelivery,LifecycleRequest
from .services import create_version,submit,decide,publish,audit
@login_required
def dashboard(request): return render(request,"gdx_admin/pages/pages/dashboard/dashboard.html",{"pages":Page.objects.all()[:20],"tasks":WorkflowTask.objects.filter(status="open")[:10]})
@login_required
def page_list(request):
    from gdx.removal import purge_due
    purge_due()
    return render(request,"gdx_admin/pages/pages/page/page_list.html",{"pages":Page.objects.filter(is_deleted=False)})
@login_required
@transaction.atomic
def page_create(request):
    pf=PageForm(request.POST or None);vf=VersionForm(request.POST or None)
    if request.method=="POST" and pf.is_valid() and vf.is_valid():
        page=pf.save(commit=False);page.created_by=request.user;page.save();create_version(page,request.user,**vf.cleaned_data);messages.success(request,"Page created.");return redirect("pages_admin:page-detail",slug=page.slug)
    return render(request,"gdx_admin/pages/pages/page/page_form.html",{"page_form":pf,"version_form":vf})
@login_required
def page_detail(request,slug):
    page=get_object_or_404(Page,slug=slug);return render(request,"gdx_admin/pages/pages/page/page_detail.html",{"page":page,"version":page.working_version or page.published_version})
@login_required
def frontend_page(request, slug):
    page = get_object_or_404(
        Page.objects.select_related("published_version", "page_type").prefetch_related("published_version__blocks"),
        slug=slug,
        is_archived=False,
        is_deleted=False,
        published_version__isnull=False,
    )
    version = page.published_version
    blocks = version.blocks.filter(is_enabled=True).order_by("position")
    return render(request, "gdx_users/apps/pages/frontend_page.html", {
        "page": page,
        "version": version,
        "blocks": blocks,
        "heading": page.title,
        "heading2": page.title,
        "pageview": "Pages",
    })
@login_required
def site_page(request, slug):
    import json
    from django.http import Http404
    from gdx.site_api import PAGE_VIEWS, SITE_MENU

    builder = PAGE_VIEWS.get(slug)
    if builder is None:
        raise Http404
    payload = json.loads(builder(request).content)
    titles = dict(SITE_MENU)
    title = titles[slug]
    return render(request, "gdx_users/apps/pages/site_page.html", {
        "slug": slug,
        "data": payload,
        "heading": title,
        "heading2": title,
        "pageview": "Pages",
    })


def _library_asset(url):
    from django.templatetags.static import static

    path = url or ""
    if path.startswith("/media/"):
        path = path[len("/media/"):]
    if path.startswith("assets/"):
        return static(f"gdx_users/frontend/{path}")
    return url or ""


def _json_payload(builder, request):
    import json

    return json.loads(builder(request).content)


def _support_payload(request):
    from gdx.site_api import support

    data = _json_payload(support, request)
    labels = {row["id"]: row["label"] for row in data["categories"]}
    for article in data["articles"]:
        article["categoryLabel"] = labels.get(article["category"], article["category"])
    return data, labels


@login_required
def support_hub(request):
    data, _labels = _support_payload(request)
    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "hub",
        "data": data,
        "heading": "Support Hub",
        "heading2": "Support Hub",
        "pageview": "Support Center",
    })


@login_required
def support_categories(request):
    data, _labels = _support_payload(request)
    counts = {}
    for article in data["articles"]:
        counts[article["category"]] = counts.get(article["category"], 0) + 1
    for row in data["categories"]:
        row["count"] = len(data["articles"]) if row["id"] == "all" else counts.get(row["id"], 0)
    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "categories",
        "data": data,
        "heading": "Categories",
        "heading2": "Categories",
        "pageview": "Support Center",
    })


@login_required
def support_articles(request):
    data, labels = _support_payload(request)
    category = (request.GET.get("category") or "").strip()
    heading = labels.get(category, "Articles") if category and category != "all" else "Articles"
    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "articles",
        "data": data,
        "active_category": category,
        "heading": heading,
        "heading2": heading,
        "pageview": "Support Center",
    })


@login_required
def support_article_page(request, source_id):
    from django.http import Http404
    from gdx.site_api import support_article

    data, labels = _support_payload(request)
    response = support_article(request, source_id)
    if response.status_code == 404:
        raise Http404
    article = _json_payload(lambda _request: response, request)
    article["categoryLabel"] = labels.get(article["category"], article["category"])
    related = [
        row for row in data["articles"]
        if row["category"] == article["category"] and row["id"] != article["id"]
    ][:4]
    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "article",
        "data": data,
        "article": article,
        "related": related,
        "heading": article["title"],
        "heading2": article["title"],
        "pageview": "Support Center",
    })


@login_required
def support_documents(request):
    from datetime import datetime

    from gdx.site_api import resources

    library = _json_payload(resources, request)
    posters = {
        "Promo Video": "assets/resources/thumbnails/video1.png",
        "Promo Video 2": "assets/resources/thumbnails/video2.png",
    }
    for group in ("documents", "policies", "processes"):
        for item in library[group]:
            item["imageUrl"] = _library_asset(item.get("imageUrl"))
            item["icon"] = _library_asset(item.get("icon"))
    for item in library["brands"]:
        item["image"] = _library_asset(item.get("image"))
    videos = []
    for item in library["media"]:
        download = item.get("downloadUrl") or ""
        posted = item.get("date") or ""
        if posted:
            posted = datetime.fromisoformat(posted).strftime("%B %-d, %Y")
        file_url = item.get("file") or ""
        if "default.mp4" in file_url:
            file_url = ""
        videos.append({
            "id": item["id"],
            "name": item["name"],
            "format": item.get("format") or "",
            "size": item.get("size") or "",
            "date": posted,
            "poster": _library_asset(posters.get(item["name"], "")),
            "playUrl": download if download.startswith("http") else _library_asset(file_url),
        })
    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "documents",
        "documents": library["documents"],
        "policies": library["policies"],
        "processes": library["processes"],
        "images": library["brands"],
        "videos": videos,
        "heading": "Documents",
        "heading2": "Documents",
        "pageview": "Support Center",
    })


def _library_when(value):
    from datetime import datetime

    from django.utils import timezone

    if not value:
        return ""
    if isinstance(value, datetime):
        if timezone.is_aware(value):
            value = timezone.localtime(value)
        return value.strftime("%B %-d, %Y, %-I:%M %p")
    return value.strftime("%B %-d, %Y")


def _library_actor(user, when):
    name = getattr(user, "username", "") or ""
    stamp = _library_when(when)
    return " · ".join(part for part in (name, stamp) if part)


def _library_facts(*pairs):
    facts = []
    for label, value, kind in pairs:
        if value in (None, ""):
            continue
        facts.append({"label": label, "value": value, "kind": kind})
    return facts


@login_required
def support_library_detail(request, pk, kind):
    from django.http import Http404
    from django.shortcuts import get_object_or_404

    from apps.resources.models import Brand, Document, Media, Policie, Processe

    preview = {"image": "", "video": "", "icon": "", "portrait": False, "dark": False}
    if kind in {"document", "policy", "process"}:
        models = {"document": Document, "policy": Policie, "process": Processe}
        labels = {"document": "Document", "policy": "Policy", "process": "Process"}
        keys = {
            "document": "resources-documents",
            "policy": "resources-policies",
            "process": "resources-processes",
        }
        record = get_object_or_404(models[kind], pk=pk, is_active=True, is_archived=False)
        kicker = labels[kind]
        manage_key = keys[kind]
        preview["portrait"] = True
        preview["image"] = _library_asset(getattr(record.cover, "url", ""))
        preview["icon"] = _library_asset(getattr(record.platform, "url", ""))
        view_url = record.view_url or getattr(record, "external_url", "")
        facts = _library_facts(
            ("Falls under", labels[kind], "text"),
            ("Name", record.name, "text"),
            ("Classification", record.classification, "text"),
            ("File format", record.file_format, "text"),
            ("Size", record.size, "text"),
            ("Description", record.desc, "text"),
            ("Kind", record.get_resource_kind_display() if hasattr(record, "get_resource_kind_display") else "", "text"),
            ("View URL", view_url, "link"),
            ("Download URL", record.download_url, "link"),
            ("Active", "Yes" if record.is_active else "No", "text"),
            ("Published at", _library_when(record.publish_at), "text"),
            ("Expired at", _library_when(record.expire_at), "text"),
            ("Created", _library_actor(record.created_by, record.created_at), "text"),
            ("Updated", _library_actor(record.updated_by, record.updated_at), "text"),
        )
    elif kind == "image":
        record = get_object_or_404(Brand, pk=pk, is_active=True, is_archived=False)
        kicker = "Image"
        manage_key = "resources-brands"
        preview["image"] = _library_asset(getattr(record.image, "url", ""))
        preview["dark"] = "Light" in (record.name or "")
        facts = _library_facts(
            ("Name", record.name, "text"),
            ("Size", record.size, "text"),
            ("Description", record.desc, "text"),
            ("Download URL", record.download_url, "link"),
            ("Active", "Yes" if record.is_active else "No", "text"),
            ("Published at", _library_when(record.publish_at), "text"),
            ("Expired at", _library_when(record.expire_at), "text"),
            ("Created", _library_actor(record.created_by, record.created_at), "text"),
            ("Updated", _library_actor(record.updated_by, record.updated_at), "text"),
        )
    elif kind == "media":
        record = get_object_or_404(Media, pk=pk, is_active=True, is_archived=False)
        kicker = "Media"
        manage_key = "resources-media"
        posters = {
            "Promo Video": "assets/resources/thumbnails/video1.png",
            "Promo Video 2": "assets/resources/thumbnails/video2.png",
        }
        file_url = getattr(record.media, "url", "") or ""
        if "default.mp4" in file_url:
            file_url = ""
        download = record.download_url or ""
        preview["image"] = _library_asset(posters.get(record.name, ""))
        preview["icon"] = _library_asset(getattr(record.icon, "url", ""))
        preview["video"] = download if str(download).startswith("http") else _library_asset(file_url)
        facts = _library_facts(
            ("Name", record.name, "text"),
            ("File format", record.file_format, "text"),
            ("Size", record.size, "text"),
            ("Date", _library_when(record.date), "text"),
            ("Download URL", download, "link"),
            ("Active", "Yes" if record.is_active else "No", "text"),
            ("Published at", _library_when(record.publish_at), "text"),
            ("Expired at", _library_when(record.expire_at), "text"),
            ("Created", _library_actor(record.created_by, record.created_at), "text"),
            ("Updated", _library_actor(record.updated_by, record.updated_at), "text"),
        )
    else:
        raise Http404
    return render(request, "gdx_users/apps/pages/library_detail.html", {
        "kicker": kicker,
        "kind": kind,
        "preview": preview,
        "facts": facts,
        "record": record,
        "manage_key": manage_key,
        "heading": record.name,
        "heading2": record.name,
        "pageview": "Documents",
    })


@login_required
def support_faqs(request):
    from gdx.site_api import faqs

    return render(request, "gdx_users/apps/pages/support_center.html", {
        "section": "faqs",
        "faqs": _json_payload(faqs, request),
        "heading": "FAQs",
        "heading2": "FAQs",
        "pageview": "Support Center",
    })
@login_required
@require_POST
def page_delete(request, slug):
    from django.core.exceptions import PermissionDenied
    from gdx.page_access import granted_actions
    from gdx.removal import allowed_mode, remove_page

    page = get_object_or_404(Page, slug=slug)
    mode = allowed_mode(granted_actions(request.user, request.path), request.POST.get("mode"))
    if mode is None:
        raise PermissionDenied
    remove_page(page, mode)
    if mode == "instant":
        messages.success(request, "Page removed.")
    else:
        messages.success(request, "Page hidden. It will be permanently removed in 7 days.")
    return redirect("pages_admin:page-list")
@login_required
def page_type_list(request): return render(request,"gdx_admin/pages/pages/governance/page_type_list.html",{"page_types":PageType.objects.all()})
@login_required
def page_type_create(request):
    form=PageTypeForm(request.POST or None)
    if request.method=="POST" and form.is_valid():form.save();messages.success(request,"Page type created.");return redirect("pages_admin:page-type-list")
    return render(request,"gdx_admin/pages/pages/governance/page_type_form.html",{"form":form})
@login_required
def page_type_edit(request,pk):
    item=get_object_or_404(PageType,pk=pk);form=PageTypeForm(request.POST or None,instance=item)
    if request.method=="POST" and form.is_valid():form.save();messages.success(request,"Page type updated.");return redirect("pages_admin:page-type-list")
    return render(request,"gdx_admin/pages/pages/governance/page_type_form.html",{"form":form,"item":item})
@login_required
@require_POST
def submit_version(request,slug,number):submit(require_version_edit(request.user,_version(slug,number)),request.user);return redirect("pages_admin:page-detail",slug=slug)
@login_required
@require_POST
def publish_version(request,slug,number):publish(require_version_view(request.user,_version(slug,number)),request.user);return redirect("pages_admin:page-detail",slug=slug)
@login_required
def workflow_list(request):return render(request,"gdx_admin/pages/pages/workflow/workflow_dashboard.html",{"tasks":WorkflowTask.objects.select_related("page","version")})
@login_required
def task_detail(request,pk):
    task=get_object_or_404(WorkflowTask,pk=pk);form=DecisionForm(request.POST or None)
    if request.method=="POST" and form.is_valid():decide(task,request.user,**form.cleaned_data);return redirect("pages_admin:workflow")
    return render(request,"gdx_admin/pages/pages/tasks/task_detail.html",{"task":task,"form":form})
@login_required
def audit_list(request):return render(request,"gdx_admin/pages/pages/audit/audit_list.html",{"events":AuditEvent.objects.select_related("actor","page")[:200]})
@login_required
def notification_list(request):return render(request,"gdx_admin/pages/pages/notifications/notification_list.html",{"items":NotificationDelivery.objects.filter(recipient=request.user)})
@login_required
def lifecycle_request(request,slug):
    page=get_object_or_404(Page,slug=slug);form=LifecycleRequestForm(request.POST or None)
    if request.method=="POST" and form.is_valid():item=form.save(commit=False);item.page=page;item.requested_by=request.user;item.save();audit(page,request.user,item.request_type+"-requested");return redirect("pages_admin:page-detail",slug=slug)
    return render(request,"gdx_admin/pages/pages/retention/lifecycle_request.html",{"page":page,"form":form})
