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
