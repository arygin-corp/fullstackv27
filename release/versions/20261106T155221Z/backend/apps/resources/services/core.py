from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import F
from django.forms.models import model_to_dict
from django.utils import timezone

from ..models import Homepage, ResourceAnalytics, ResourceApprovalAudit, ResourceChangeRequest, ResourceVersion
from ..permissions import can_approve, group_names

NOTIFICATION_HOOKS=[]
def register_notification_hook(callback): NOTIFICATION_HOOKS.append(callback)
def emit(event, **payload):
    for callback in NOTIFICATION_HOOKS: callback(event=event, **payload)

def snapshot(instance):
    data=model_to_dict(instance)
    for k,v in list(data.items()):
        if hasattr(v,'isoformat'): data[k]=v.isoformat()
        elif hasattr(v,'name'): data[k]=v.name
    return data

def audit(event, actor=None, change_request=None, before=None, after=None, comment=''):
    return ResourceApprovalAudit.objects.create(change_request=change_request,event=event,actor=actor,
        actor_groups=sorted(group_names(actor)),before_snapshot=before or {},after_snapshot=after or {},comment=comment)

@transaction.atomic
def publish_resource(resource, actor=None, event=ResourceApprovalAudit.Event.APPLIED):
    before=snapshot(resource)
    if isinstance(resource, Homepage):
        Homepage.objects.select_for_update().filter(is_active=True,is_archived=False).exclude(pk=resource.pk).update(is_active=False)
    resource.is_archived=False; resource.archived_at=None; resource.archived_by=None; resource.is_active=True
    resource.full_clean(); resource.save()
    audit(event,actor,before=before,after=snapshot(resource)); return resource

@transaction.atomic
def archive_resource(resource, actor=None, scheduled=False):
    before=snapshot(resource); resource.is_active=False; resource.is_archived=True; resource.archived_at=timezone.now(); resource.archived_by=actor
    resource.full_clean(); resource.save()
    event=ResourceApprovalAudit.Event.SCHEDULED_ARCHIVE if scheduled else ResourceApprovalAudit.Event.ARCHIVED
    audit(event,actor,before=before,after=snapshot(resource)); emit('RESOURCE_SCHEDULED_ARCHIVE' if scheduled else 'RESOURCE_ARCHIVED',resource=resource,actor=actor); return resource

@transaction.atomic
def restore_resource(resource, actor=None):
    before=snapshot(resource); resource.is_archived=False; resource.archived_at=None; resource.archived_by=None; resource.is_active=True
    if isinstance(resource, Homepage): Homepage.objects.select_for_update().filter(is_active=True,is_archived=False).exclude(pk=resource.pk).update(is_active=False)
    resource.full_clean(); resource.save(); audit(ResourceApprovalAudit.Event.RESTORED,actor,before=before,after=snapshot(resource)); emit('RESOURCE_RESTORED',resource=resource,actor=actor); return resource

def validate_proposal(change_request):
    change_request.full_clean()
    model=change_request.resource_type.model_class()
    allowed={f.name for f in model._meta.fields if f.editable and not f.primary_key}
    invalid=set(change_request.proposed_data)-allowed
    if invalid: raise ValidationError({'proposed_data':f'Unknown or protected fields: {sorted(invalid)}'})
    if change_request.resource:
        candidate=model.objects.get(pk=change_request.resource_id)
        for key,value in change_request.proposed_data.items(): setattr(candidate,key,value)
        candidate.full_clean()
    return change_request

@transaction.atomic
def submit_change(change_request):
    if change_request.status != ResourceChangeRequest.Status.DRAFT: raise ValidationError('Only drafts may be submitted.')
    validate_proposal(change_request); change_request.status=ResourceChangeRequest.Status.PENDING; change_request.submitted_at=timezone.now(); change_request.save()
    audit(ResourceApprovalAudit.Event.SUBMITTED,change_request.submitter,change_request,comment=change_request.comment); emit('RESOURCE_PROPOSAL_SUBMITTED',change_request=change_request); emit('RESOURCE_APPROVAL_REQUIRED',change_request=change_request); return change_request

@transaction.atomic
def approve_change(change_request, approver, comment=''):
    if change_request.status != ResourceChangeRequest.Status.PENDING: raise ValidationError('Only pending requests may be approved.')
    if not can_approve(approver,change_request): raise PermissionDenied('Approval is not permitted.')
    validate_proposal(change_request); change_request.approver=approver; change_request.status=ResourceChangeRequest.Status.APPROVED; change_request.decided_at=timezone.now(); change_request.comment=comment; change_request.full_clean(); change_request.save()
    audit(ResourceApprovalAudit.Event.APPROVED,approver,change_request,comment=comment); emit('RESOURCE_PROPOSAL_APPROVED',change_request=change_request); return change_request

@transaction.atomic
def reject_change(change_request, approver, comment=''):
    if change_request.status != ResourceChangeRequest.Status.PENDING or not can_approve(approver,change_request): raise PermissionDenied('Rejection is not permitted.')
    change_request.approver=approver; change_request.status=ResourceChangeRequest.Status.REJECTED; change_request.decided_at=timezone.now(); change_request.comment=comment; change_request.full_clean(); change_request.save()
    audit(ResourceApprovalAudit.Event.REJECTED,approver,change_request,comment=comment); emit('RESOURCE_PROPOSAL_REJECTED',change_request=change_request); return change_request

@transaction.atomic
def apply_change(change_request, actor):
    if change_request.status != ResourceChangeRequest.Status.APPROVED: raise ValidationError('Only approved changes may be applied.')
    obj=change_request.resource; before=snapshot(obj) if obj else {}
    if change_request.action==ResourceChangeRequest.Action.ARCHIVE: obj=archive_resource(obj,actor)
    elif change_request.action==ResourceChangeRequest.Action.RESTORE: obj=restore_resource(obj,actor)
    elif change_request.action==ResourceChangeRequest.Action.PUBLISH: obj=publish_resource(obj,actor)
    elif change_request.action==ResourceChangeRequest.Action.UNPUBLISH: obj.is_active=False; obj.save()
    else:
        model=change_request.resource_type.model_class()
        if obj and model.__name__ in {'Document','Policie','Processe'}: create_version(obj,actor,change_request)
        if obj is None: obj=model()
        for key,value in change_request.proposed_data.items(): setattr(obj,key,value)
        obj.updated_by=actor; obj.full_clean(); obj.save(); change_request.resource_id=obj.pk
    change_request.status=ResourceChangeRequest.Status.APPLIED; change_request.applied_at=timezone.now(); change_request.save()
    audit(ResourceApprovalAudit.Event.APPLIED,actor,change_request,before, snapshot(obj)); emit('RESOURCE_PROPOSAL_APPLIED',change_request=change_request); return obj

def create_version(resource, actor, change_request=None):
    ct=ContentType.objects.get_for_model(resource,for_concrete_model=False)
    last=ResourceVersion.objects.filter(resource_type=ct,resource_id=resource.pk).order_by('-version_number').first()
    return ResourceVersion.objects.create(resource_type=ct,resource_id=resource.pk,version_number=(last.version_number+1 if last else 1),snapshot=snapshot(resource),change_request=change_request,created_by=actor)

@transaction.atomic
def restore_version(version, actor):
    obj=version.resource
    if not obj: raise ValidationError('The version target no longer exists.')
    create_version(obj,actor)
    editable={f.name for f in obj._meta.fields if f.editable and not f.primary_key}
    for key,value in version.snapshot.items():
        if key in editable: setattr(obj,key,value)
    obj.full_clean(); obj.save(); emit('RESOURCE_VERSION_RESTORED',resource=obj,version=version,actor=actor); return obj

def increment_analytics(resource, metric):
    allowed={'visits','views','downloads','opens'}
    if metric not in allowed: raise ValidationError('Unsupported analytics metric.')
    ct=ContentType.objects.get_for_model(resource,for_concrete_model=False)
    row,_=ResourceAnalytics.objects.get_or_create(resource_type=ct,resource_id=resource.pk)
    ResourceAnalytics.objects.filter(pk=row.pk).update(**{metric:F(metric)+1})
