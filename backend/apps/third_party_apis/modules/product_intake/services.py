from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from django.utils.html import strip_tags
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.marketplace.models import Product
from .access import can_activate_product, can_approve_or_reject, can_manage_workflow, normalized_email
from .audit import snapshot, write_audit
from .models import IntakeApprovalEvent, ProductIntake
from .notifications import notify_approval, notify_product_available, notify_rejection, notify_resubmission, notify_submission


def _event(intake, action, old, actor, reason="", comments=""):
    return IntakeApprovalEvent.objects.create(
        intake=intake, action=action, from_status=old, to_status=intake.status,
        reason=reason, comments=comments, actor=actor,
        actor_email=normalized_email(getattr(actor, "email", "")),
    )


def _require_workflow(actor):
    if not can_manage_workflow(actor):
        raise PermissionDenied("Content Manager Group, Adminsitrator Group, or Super Administrator Group membership is required.")


@transaction.atomic
def submit_intake(*, intake_id, actor, request=None):
    intake = ProductIntake.objects.select_for_update().get(pk=intake_id)
    actor_email = normalized_email(getattr(actor, "email", ""))
    allowed = actor_email in {normalized_email(intake.requester_email), normalized_email(intake.submitted_by_email)} or can_manage_workflow(actor)
    if not actor or not actor.is_authenticated or not actor.is_active or not allowed:
        raise PermissionDenied("Only the requester, submitter, or an authorized workflow member can submit.")
    if intake.status not in {ProductIntake.Status.DRAFT, ProductIntake.Status.RESUBMITTED}:
        raise ValidationError({"status": "This intake cannot be submitted from its current status."})
    before = snapshot(intake); old = intake.status
    intake.status = ProductIntake.Status.SUBMITTED
    intake.submitted_at = timezone.now()
    intake.sla_due_at = intake.submitted_at + timedelta(hours=160)
    intake.updated_by = actor
    intake.save()
    _event(intake, IntakeApprovalEvent.Action.SUBMITTED, old, actor, "Submitted for review.")
    write_audit(intake=intake, action="submitted", actor=actor, request=request, before=before)
    notify_submission(intake)
    return intake


@transaction.atomic
def start_review(*, intake_id, actor, request=None):
    _require_workflow(actor)
    intake = ProductIntake.objects.select_for_update().get(pk=intake_id)
    if intake.status not in {ProductIntake.Status.SUBMITTED, ProductIntake.Status.ASSIGNED, ProductIntake.Status.RESUBMITTED}:
        raise ValidationError({"status": "This intake cannot enter review."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.UNDER_REVIEW; intake.review_started_at=timezone.now(); intake.updated_by=actor; intake.save()
    _event(intake, IntakeApprovalEvent.Action.REVIEW_STARTED, old, actor, "Review started.")
    write_audit(intake=intake, action="review_started", actor=actor, request=request, before=before)
    return intake


@transaction.atomic
def reject_intake(*, intake_id, reason, comments, actor, request=None):
    if not can_approve_or_reject(actor):
        raise PermissionDenied("Only approved workflow groups can reject submissions.")
    reason=(reason or "").strip(); comments=(comments or "").strip()
    errors={}
    if not reason: errors["reason"]="A rejection reason is required."
    if len(comments)<10: errors["comments"]="Comments must be at least 10 characters and explain what to correct."
    if errors: raise ValidationError(errors)
    intake=ProductIntake.objects.select_for_update().get(pk=intake_id)
    if intake.status != ProductIntake.Status.UNDER_REVIEW:
        raise ValidationError({"status":"Only an intake under review can be rejected."})
    if intake.marketplace_product_id:
        raise ValidationError({"marketplace_product":"An intake with a Marketplace product cannot be rejected."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.REJECTED; intake.rejection_reason=reason; intake.rejection_comments=comments
    intake.decision_at=timezone.now(); intake.decided_by=actor; intake.updated_by=actor; intake.save()
    _event(intake, IntakeApprovalEvent.Action.REJECTED, old, actor, reason, comments)
    write_audit(intake=intake, action="rejected", actor=actor, request=request, before=before)
    notify_rejection(intake)
    return intake


@transaction.atomic
def resubmit_intake(*, intake_id, actor, request=None):
    intake=ProductIntake.objects.select_for_update().get(pk=intake_id)
    actor_email=normalized_email(getattr(actor,"email",""))
    if not actor or not actor.is_authenticated or not actor.is_active:
        raise PermissionDenied("Authentication is required.")
    if actor_email not in {normalized_email(intake.requester_email), normalized_email(intake.submitted_by_email)} and not can_manage_workflow(actor):
        raise PermissionDenied("Only the requester, submitter, or workflow group may resubmit.")
    if intake.status != ProductIntake.Status.REJECTED:
        raise ValidationError({"status":"Only rejected intakes can be resubmitted."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.RESUBMITTED; intake.rejection_reason=""; intake.rejection_comments=""
    intake.decision_at=None; intake.decided_by=None; intake.updated_by=actor; intake.save()
    _event(intake, IntakeApprovalEvent.Action.RESUBMITTED, old, actor, "Resubmitted after correction.")
    write_audit(intake=intake, action="resubmitted", actor=actor, request=request, before=before)
    notify_resubmission(intake)
    return intake


@transaction.atomic
def assign_intake(*, intake_id, assignee, reason, actor, request=None):
    _require_workflow(actor)
    intake=ProductIntake.objects.select_for_update().get(pk=intake_id)
    if intake.status not in {ProductIntake.Status.SUBMITTED,ProductIntake.Status.RESUBMITTED}:
        raise ValidationError({"status":"Only submitted or resubmitted intakes can be assigned."})
    if not can_manage_workflow(assignee):
        raise ValidationError({"user_id":"Assignee must be an active workflow-group member."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.ASSIGNED; intake.assigned_to=assignee; intake.assigned_at=timezone.now(); intake.updated_by=actor; intake.save()
    _event(intake,IntakeApprovalEvent.Action.ASSIGNED,old,actor,reason)
    write_audit(intake=intake,action="assigned",actor=actor,request=request,before=before)
    return intake


@transaction.atomic
def request_information(*, intake_id, reason, actor, request=None):
    _require_workflow(actor)
    reason=(reason or "").strip()
    if not reason: raise ValidationError({"reason":"A reason is required."})
    intake=ProductIntake.objects.select_for_update().get(pk=intake_id)
    if intake.status != ProductIntake.Status.UNDER_REVIEW:
        raise ValidationError({"status":"Information can only be requested during review."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.NEEDS_INFORMATION; intake.rejection_reason=reason; intake.updated_by=actor; intake.save()
    _event(intake,IntakeApprovalEvent.Action.INFORMATION_REQUESTED,old,actor,reason)
    write_audit(intake=intake,action="information_requested",actor=actor,request=request,before=before)
    from .notifications import create_notification, queue_email
    create_notification(intake=intake,email=intake.requester_email,first_name=intake.requester_first_name,last_name=intake.requester_last_name,event="information_requested",severity="warning",title="More information required",message=reason)
    queue_email(intake=intake,email=intake.requester_email,event="information_requested",template="information_requested")
    return intake


@transaction.atomic
def approve_intake(*, intake_id, reason, actor, request=None):
    if not can_approve_or_reject(actor):
        raise PermissionDenied("Only approved workflow groups can approve submissions.")
    reason=(reason or "").strip()
    if not reason: raise ValidationError({"reason":"An approval reason is required."})
    intake=ProductIntake.objects.select_for_update().get(pk=intake_id)
    if intake.status != ProductIntake.Status.UNDER_REVIEW:
        raise ValidationError({"status":"Only an intake under review can be approved."})
    if intake.marketplace_product_id:
        raise ValidationError({"marketplace_product":"A Marketplace product already exists for this intake."})
    before=snapshot(intake); old=intake.status
    intake.status=ProductIntake.Status.APPROVED; intake.approval_reason=reason
    intake.decision_at=timezone.now(); intake.decided_by=actor; intake.updated_by=actor; intake.save()
    _event(intake, IntakeApprovalEvent.Action.APPROVED, old, actor, reason)
    write_audit(intake=intake, action="approved", actor=actor, request=request, before=before)
    notify_approval(intake)
    return intake


@transaction.atomic
def create_draft_product(*, intake_id, reason, actor, request=None):
    if not can_approve_or_reject(actor):
        raise PermissionDenied("Only approved workflow groups can add a draft product.")
    reason=(reason or "").strip()
    if not reason: raise ValidationError({"reason":"A reason is required."})
    intake=(ProductIntake.objects.select_for_update().select_related(
        "marketplace_domain","marketplace_datatype","marketplace_classification","marketplace_product"
    ).get(pk=intake_id))
    if intake.status != ProductIntake.Status.APPROVED:
        raise ValidationError({"status":"Only an approved intake can be added as a draft product."})
    if intake.marketplace_product_id:
        raise ValidationError({"marketplace_product":"A Marketplace product already exists for this intake."})
    missing=[]
    if not intake.marketplace_domain_id: missing.append("marketplace_domain")
    if not intake.marketplace_datatype_id: missing.append("marketplace_datatype")
    if not intake.marketplace_classification_id: missing.append("marketplace_classification")
    if missing: raise ValidationError({field:"Required before a draft product can be created." for field in missing})
    before=snapshot(intake); old=intake.status
    product=Product.objects.create(
        name=intake.product_name,
        brief_desc=intake.product_desc,
        short_desc=strip_tags(intake.product_desc or "")[:1000],
        domain=intake.marketplace_domain,
        datatype=intake.marketplace_datatype,
        classification=intake.marketplace_classification,
        pi=intake.product_pii,
        sensitive_pi=intake.product_spi,
        status="draft", cwpg_status="draft", is_active=False,
        fulfillment_group=None, route_identifier=None, data_steward=None,
        poc_name=None, business_contact_name=None, business_sme=None,
        created_by=actor, updated_by=actor,
    )
    intake.status=ProductIntake.Status.PRODUCT_DRAFT
    intake.marketplace_product=product
    intake.updated_by=actor
    intake.save()
    _event(intake, IntakeApprovalEvent.Action.PRODUCT_DRAFTED, old, actor, reason)
    write_audit(intake=intake, action="product_drafted", actor=actor, request=request, before=before)
    from .notifications import notify_draft_product
    notify_draft_product(intake)
    return intake


@transaction.atomic
def curate_product(*, intake_id, reason, actor, request=None):
    if not can_approve_or_reject(actor):
        raise PermissionDenied("Only approved workflow groups can curate products.")
    reason=(reason or "").strip()
    if not reason: raise ValidationError({"reason":"A curation reason is required."})
    intake=ProductIntake.objects.select_for_update().select_related("marketplace_product").get(pk=intake_id)
    if intake.status != ProductIntake.Status.PRODUCT_DRAFT or not intake.marketplace_product_id:
        raise ValidationError({"status":"Only a draft Marketplace product can be curated."})
    product=Product.objects.select_for_update().get(pk=intake.marketplace_product_id)
    if product.status != "draft" or product.is_active:
        raise ValidationError({"marketplace_product":"Curation is only for an unpublished draft product."})
    before=snapshot(intake); old=intake.status
    product.cwpg_status="approved"
    product.updated_by=actor
    product.save()
    intake.status=ProductIntake.Status.CURATED
    intake.updated_by=actor
    intake.save()
    _event(intake, IntakeApprovalEvent.Action.CURATED, old, actor, reason)
    write_audit(intake=intake, action="curated", actor=actor, request=request, before=before)
    from .notifications import notify_curated
    notify_curated(intake)
    return intake


@transaction.atomic
def activate_marketplace_product(*, intake_id, reason, actor, request=None):
    if not can_activate_product(actor):
        raise PermissionDenied("Only approved workflow groups can activate products.")
    reason=(reason or "").strip()
    if not reason: raise ValidationError({"reason":"An activation reason is required."})
    intake=ProductIntake.objects.select_for_update().select_related("marketplace_product").get(pk=intake_id)
    if intake.status != ProductIntake.Status.CURATED or not intake.marketplace_product_id:
        raise ValidationError({"status":"Only a curated product can be activated."})
    product=Product.objects.select_for_update().get(pk=intake.marketplace_product_id)
    if product.is_active:
        return intake
    before=snapshot(intake); old=intake.status; now=timezone.now()
    product.status="approved"; product.cwpg_status="cwpg_approved"; product.is_active=True
    product.approved_by=actor; product.approved_at=now; product.updated_by=actor; product.save()
    intake.status=ProductIntake.Status.ARCHIVED; intake.is_active=False; intake.implemented_at=now; intake.updated_by=actor; intake.save()
    _event(intake, IntakeApprovalEvent.Action.ARCHIVED, old, actor, reason)
    write_audit(intake=intake, action="marketplace_product_activated", actor=actor, request=request, before=before)
    notify_product_available(intake)
    return intake
