"""Pending approvals from every workflow, shown on one Command Center page."""
import logging

from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone

logger = logging.getLogger(__name__)

WORKFLOW_URL = "/sa/command-center/workflow/"


def _content_manager(user):
    return user.is_superuser or user.groups.filter(name="Content Manager Group").exists()


def _item(kind, object_id, title, detail, source, status, when, can_decide, action="", action_label="", review=None):
    return {
        "kind": kind,
        "object_id": str(object_id),
        "anchor": f"{kind}-{object_id}",
        "title": title or "Untitled",
        "detail": detail or "",
        "source": source,
        "status": status,
        "when": when,
        "can_decide": can_decide,
        "action": action,
        "action_label": action_label,
        "review": review,
    }


def _reviews(user):
    from apps.marketplace.models import Product, Review
    from apps.notifications.services.work import _person

    rows = list(
        Review.objects.filter(status="pending")
        .select_related("author")
        .only(
            "id", "title", "comment", "rating", "status", "created_at", "product_id", "author",
            "quality", "value_for_money", "ease_of_use", "durability", "would_recommend", "met_expectations",
        )
        .order_by("-created_at")[:50]
    )
    names = {
        row["id"]: row["name"] or "Untitled product"
        for row in Product.objects.filter(id__in=[item.product_id for item in rows]).values("id", "name")
    }
    allowed = _content_manager(user)
    return [
        _item(
            "review",
            item.pk,
            "Product Review",
            "",
            "Product review",
            "Pending approval",
            item.created_at,
            allowed,
            review={
                "title": item.title or "",
                "product": names.get(item.product_id, "Product"),
                "author": _person(item.author),
                "rating": item.rating,
                "comment": item.comment or "",
                "quality": item.quality,
                "value_for_money": item.value_for_money,
                "ease_of_use": item.ease_of_use,
                "durability": item.durability,
                "would_recommend": item.would_recommend,
                "met_expectations": item.met_expectations,
            },
        )
        for item in rows
    ]


def _products(user):
    from apps.marketplace.models import Product

    rows = Product.objects.filter(status="pending").values("id", "name", "sku", "created_at").order_by("-created_at")[:50]
    allowed = _content_manager(user)
    return [
        _item(
            "product",
            row["id"],
            row["name"] or "Untitled product",
            f"SKU {row['sku']}" if row["sku"] else "Marketplace product",
            "Product",
            "Pending",
            row["created_at"],
            allowed,
        )
        for row in rows
    ]


def _releases(user):
    from apps.changelog.models import Post, ReleaseStatus

    actions = {
        ReleaseStatus.DRAFT: ("submit", "Submit for review", "changelog.change_post"),
        ReleaseStatus.REVIEW: ("approve", "Approve", "changelog.approve_post"),
        ReleaseStatus.APPROVED: ("publish", "Publish now", "changelog.publish_post"),
        ReleaseStatus.PUBLISHED: ("archive", "Archive", "changelog.publish_post"),
    }
    rows = (
        Post.objects.filter(status__in=actions)
        .only("id", "version", "title", "status", "created_at")
        .order_by("-id")[:50]
    )
    items = []
    for item in rows:
        action, label, permission = actions[item.status]
        items.append(
            _item(
                "release",
                item.pk,
                item.title,
                f"Version {item.version}",
                "Changelog",
                item.get_status_display(),
                item.created_at,
                user.is_superuser or user.has_perm(permission),
                action,
                label,
            )
        )
    return items


def _intakes(user):
    from apps.third_party_apis.modules.product_intake.models import ProductIntake

    waiting = [
        ProductIntake.Status.SUBMITTED,
        ProductIntake.Status.ASSIGNED,
        ProductIntake.Status.UNDER_REVIEW,
        ProductIntake.Status.RESUBMITTED,
    ]
    rows = ProductIntake.objects.filter(status__in=waiting).values("id", "product_name", "status", "created_at").order_by("-created_at")[:50]
    allowed = _content_manager(user)
    labels = dict(ProductIntake.Status.choices)
    return [
        _item("intake", row["id"], row["product_name"] or f"Intake {row['id']}", "Product intake", "Product intake", labels.get(row["status"], row["status"]), row["created_at"], allowed)
        for row in rows
    ]


def _page_tasks(user):
    from apps.pages.models import WorkflowTask

    rows = WorkflowTask.objects.filter(status=WorkflowTask.Status.OPEN).select_related("page").order_by("-created_at")[:50]
    allowed = _content_manager(user)
    return [
        _item(
            "page",
            item.pk,
            getattr(item.page, "slug", None) or "Page review",
            item.assigned_group_name,
            "Page workflow",
            "Open",
            item.created_at,
            allowed,
        )
        for item in rows
    ]


def _approval_tasks(user):
    from apps.workflow_engine.models import ApprovalTask

    rows = (
        ApprovalTask.objects.filter(status=ApprovalTask.Status.PENDING)
        .select_related("assigned_to")
        .order_by("-id")[:50]
    )
    items = []
    for item in rows:
        assigned = ""
        if item.assigned_to_id:
            assigned = (item.assigned_to.get_full_name() or "").strip() or item.assigned_to.get_username()
        items.append(
            _item(
                "task",
                item.pk,
                f"Workflow task {item.pk}",
                assigned or item.role or "Unassigned",
                "Workflow",
                "Pending",
                getattr(item, "created_at", None),
                user.is_superuser or item.assigned_to_id == user.id,
            )
        )
    return items


def pending_approvals(user):
    collectors = (_reviews, _products, _releases, _intakes, _page_tasks, _approval_tasks)
    items = []
    for collector in collectors:
        try:
            items.extend(collector(user))
        except Exception:
            logger.exception("Could not load %s approvals", collector.__name__)
    return items


def decide_approval(user, kind, object_id, decision, comment):
    allowed = {"approved", "rejected", "submit", "approve", "publish", "archive"}
    if decision not in allowed:
        raise ValidationError("Choose a workflow action.")
    comment = (comment or "").strip()
    if kind == "review":
        return _decide_review(user, object_id, decision)
    if kind == "product":
        return _decide_product(user, object_id, decision)
    if kind == "release":
        return _decide_release(user, object_id, decision)
    if kind == "intake":
        return _decide_intake(user, object_id, decision, comment)
    if kind == "page":
        return _decide_page(user, object_id, decision, comment)
    if kind == "task":
        return _decide_task(user, object_id, decision, comment)
    raise ValidationError("That approval is not available.")


def _decide_review(user, object_id, decision):
    from apps.marketplace.models import Review

    if not _content_manager(user):
        raise PermissionDenied("Only the Content Manager Group can approve reviews.")
    review = Review.objects.only("id", "status", "product_id", "author_id", "title").get(pk=object_id)
    if review.status != "pending":
        raise ValidationError("This review was already decided.")
    review.status = decision
    review.save(update_fields=["status"])


def _decide_product(user, object_id, decision):
    from apps.marketplace.models import Product

    if not _content_manager(user):
        raise PermissionDenied("Only the Content Manager Group can approve products.")
    if decision == "approved":
        updated = Product.objects.filter(pk=object_id, status="pending").update(
            status="approved",
            approved_by=user,
            approved_at=timezone.now(),
        )
    else:
        updated = Product.objects.filter(pk=object_id, status="pending").update(status="draft", approved_at=None, approved_by=None)
    if not updated:
        raise ValidationError("This product was already decided.")


def _decide_release(user, object_id, decision):
    from apps.changelog.models import Post
    from apps.changelog.services import approve_release, archive_release, publish_release, submit_for_review

    operations = {
        "submit": (submit_for_review, "changelog.change_post"),
        "approve": (approve_release, "changelog.approve_post"),
        "approved": (approve_release, "changelog.approve_post"),
        "publish": (publish_release, "changelog.publish_post"),
        "archive": (archive_release, "changelog.publish_post"),
    }
    if decision not in operations:
        raise ValidationError("Changelog releases use submit, approve, publish, and archive.")
    operation, permission = operations[decision]
    if not user.is_superuser and not user.has_perm(permission):
        raise PermissionDenied("You do not have permission for this release action.")
    operation(Post.objects.get(pk=object_id), user)


def _decide_intake(user, object_id, decision, comment):
    from apps.third_party_apis.modules.product_intake.services import approve_intake, reject_intake

    if decision == "approved":
        approve_intake(intake_id=object_id, reason=comment or "Approved from the Command Center.", actor=user)
        return
    reject_intake(intake_id=object_id, reason=comment or "Rejected from the Command Center.", comments=comment or "Please correct the intake and resubmit.", actor=user)


def _decide_page(user, object_id, decision, comment):
    from apps.pages.models import Approval, WorkflowTask
    from apps.pages.services import decide

    task = WorkflowTask.objects.get(pk=object_id, status=WorkflowTask.Status.OPEN)
    choice = Approval.Decision.APPROVED if decision == "approved" else Approval.Decision.REJECTED
    text = comment or ("Approved from the Command Center workflow page." if decision == "approved" else "Rejected from the Command Center workflow page. Please revise and submit again.")
    decide(task, user, choice, text)


def _decide_task(user, object_id, decision, comment):
    from apps.workflow_engine.models import ApprovalTask

    task = ApprovalTask.objects.get(pk=object_id, status=ApprovalTask.Status.PENDING)
    if not user.is_superuser and task.assigned_to_id != user.id:
        raise PermissionDenied("This workflow task is assigned to someone else.")
    task.status = ApprovalTask.Status.APPROVED if decision == "approved" else ApprovalTask.Status.REJECTED
    task.decision_comment = comment
    task.decided_at = timezone.now()
    task.save(update_fields=["status", "decision_comment", "decided_at"])
