from django.core.exceptions import PermissionDenied,ValidationError
from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from .models import *
def audit(page,user,action,version=None,**details): return AuditEvent.objects.create(page=page,page_slug_snapshot=page.slug,version_number=getattr(version,"number",None),action=action,actor=user,details=details)
@transaction.atomic
def create_version(page,user,title,summary=""):
    page=Page.objects.select_for_update().get(pk=page.pk);number=(page.versions.aggregate(n=Max("number"))["n"] or 0)+1;v=PageVersion.objects.create(page=page,number=number,title=title,summary=summary,created_by=user);page.working_version=v;page.save(update_fields=("working_version","updated_at"));audit(page,user,"version-created",v);return v
@transaction.atomic
def submit(version,user):
    if version.status!=PageVersion.Status.DRAFT: raise ValidationError("Only drafts can be submitted.")
    specs=[(ReviewRequirement.Type.CONTENT,"Content Manager Group")]
    pt=version.page.page_type
    if pt.name and getattr(pt,"requires_product_review",False): specs.append((ReviewRequirement.Type.PRODUCT,"Content Manager Group"))
    for kind,group in specs:
        req,_=ReviewRequirement.objects.get_or_create(version=version,review_type=kind,defaults={"group_name":group});WorkflowTask.objects.get_or_create(requirement=req,defaults={"page":version.page,"version":version,"assigned_group_name":group})
    version.status=PageVersion.Status.REVIEW;version.save();audit(version.page,user,"submitted",version);return version
@transaction.atomic
def decide(task,user,decision,comment):
    if not user.is_superuser and not user.groups.filter(name=task.assigned_group_name).exists(): raise PermissionDenied
    a=Approval(requirement=task.requirement,reviewer=user,reviewer_group_name=task.assigned_group_name,decision=decision,comment=comment);a.save();task.status=WorkflowTask.Status.COMPLETED;task.completed_at=timezone.now();task.save();v=task.version
    if decision==Approval.Decision.REJECTED:v.status=PageVersion.Status.DRAFT
    elif decision==Approval.Decision.REVISION:v.status=PageVersion.Status.DRAFT
    elif not v.tasks.filter(status=WorkflowTask.Status.OPEN).exists():v.status=PageVersion.Status.APPROVED
    v.save();audit(v.page,user,"review-"+decision,v,comment=comment);return a
@transaction.atomic
def publish(version,user):
    if not user.is_superuser and not user.has_perm("pages.change_page"): raise PermissionDenied
    if version.status!=PageVersion.Status.APPROVED: raise ValidationError("Only approved versions can publish.")
    p=Page.objects.select_for_update().get(pk=version.page_id)
    if p.published_version_id: PageVersion.objects.filter(pk=p.published_version_id).update(status=PageVersion.Status.SUPERSEDED)
    version.status=PageVersion.Status.PUBLISHED;version.save();p.published_version=version;p.working_version=None;p.save();audit(p,user,"published",version);return p
