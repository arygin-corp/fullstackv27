"""Bring approvals and alerts from other apps into the notification inbox."""
import logging

from django.apps import apps
from django.db.models.signals import post_save

from apps.notifications.models import NotificationType
from apps.notifications.services.ingress import notification_type_for, publish, publish_for_email

logger = logging.getLogger(__name__)


def _on_intake_notification(sender, instance, created, **kwargs):
    if not created:
        return
    publish_for_email(
        email=instance.recipient_email,
        title=instance.title,
        body=instance.message,
        url="/sa/command-center/workflow/" if instance.event in {"review_required", "approval_requested", "pending_approval"} else instance.action_url,
        notification_type=notification_type_for(instance.event),
        source="product_intake",
        source_object_type="ProductIntake",
        source_object_id=instance.intake_id,
        idempotency_key=f"intake-notification:{instance.pk}",
    )


def _on_changelog_notification(sender, instance, created, **kwargs):
    if not created:
        return
    publish(
        recipient=instance.user,
        title=instance.title,
        body=instance.message,
        url="/changelog/notifications/",
        notification_type=NotificationType.SYSTEM,
        source="changelog",
        source_object_type="Post",
        source_object_id=instance.post_id,
        idempotency_key=f"changelog-notification:{instance.pk}",
    )


def _on_approval_task(sender, instance, created, **kwargs):
    if not created or not instance.assigned_to_id or instance.status != instance.Status.PENDING:
        return
    workflow = getattr(instance, "instance", None)
    publish(
        recipient=instance.assigned_to,
        title="Approval needed",
        body=f"{workflow} is waiting for your decision." if workflow else "A workflow is waiting for your decision.",
        url="/sa/command-center/workflow/",
        notification_type=NotificationType.APPROVAL,
        source="workflow",
        source_object_type="ApprovalTask",
        source_object_id=instance.pk,
        idempotency_key=f"approval-task:{instance.pk}",
    )


def _product_name(review):
    from django.apps import apps

    product = apps.get_model("marketplace", "Product")
    name = product.objects.defer("alt_approver").filter(pk=review.product_id).values_list("name", flat=True).first()
    return name or "this product"


def _person(user):
    name = (user.get_full_name() or "").strip()
    return name or user.get_username()


def notify_review_pending(review):
    from django.contrib.auth.models import Group

    author = _person(review.author)
    product_name = _product_name(review)
    group = Group.objects.filter(name="Content Manager Group").first()
    members = group.user_set.filter(is_active=True) if group else []
    for user in members:
        notification, _created = publish(
            recipient=user,
            title="Review waiting for approval",
            body=f"{author} submitted “{review.title}” for {product_name}. It stays unpublished until the Content Manager Group approves it.",
            notification_type=NotificationType.APPROVAL,
            source="marketplace",
            source_object_type="Review",
            source_object_id=review.pk,
            idempotency_key=f"review-pending:{review.pk}:user:{user.pk}",
        )
        if notification is not None:
            detail_url = f"/marketplace/reviews/{review.pk}/workflow/"
            if notification.url != detail_url:
                notification.url = detail_url
                notification.save(update_fields=["url"])
    publish(
        recipient=review.author,
        title="Your review was submitted",
        body=f"Your review of {product_name} is waiting for the Content Manager Group to approve it.",
        notification_type=NotificationType.SYSTEM,
        source="marketplace",
        source_object_type="Review",
        source_object_id=review.pk,
        idempotency_key=f"review-submitted:{review.pk}",
    )


def notify_review_decision(review):
    if review.status == "approved":
        title = "Your review was approved"
        body = f"Your review of {_product_name(review)} is now published."
    elif review.status == "rejected":
        title = "Your review was not approved"
        body = f"The Content Manager Group did not approve your review of {_product_name(review)}."
    else:
        return
    publish(
        recipient=review.author,
        title=title,
        body=body,
        notification_type=NotificationType.APPROVAL,
        source="marketplace",
        source_object_type="Review",
        source_object_id=review.pk,
        idempotency_key=f"review-{review.status}:{review.pk}",
    )


def _remember_review_status(sender, instance, **kwargs):
    if not instance.pk:
        return
    instance._previous_review_status = sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()


def _on_review(sender, instance, created, **kwargs):
    if created:
        notify_review_pending(instance)
        return
    previous = getattr(instance, "_previous_review_status", None)
    if previous and previous != instance.status:
        notify_review_decision(instance)


def _connect(app_label, model_name, handler, uid):
    try:
        model = apps.get_model(app_label, model_name)
    except LookupError:
        return
    post_save.connect(handler, sender=model, dispatch_uid=uid)


def backfill_inbox():
    """Copy notices that were stored outside the inbox into /sa/notifications/."""
    try:
        changelog_notification = apps.get_model("changelog", "Notification")
    except LookupError:
        changelog_notification = None
    if changelog_notification is not None:
        for item in changelog_notification.objects.all():
            _on_changelog_notification(changelog_notification, item, created=True)
    try:
        review_model = apps.get_model("marketplace", "Review")
    except LookupError:
        review_model = None
    if review_model is not None:
        for review in review_model.objects.select_related("author", "product").defer("product__alt_approver").filter(status="pending"):
            notify_review_pending(review)
        for review in review_model.objects.select_related("author", "product").defer("product__alt_approver").exclude(status="pending"):
            notify_review_decision(review)


def autodiscover_work_adapters():
    _connect("intake", "UserNotification", _on_intake_notification, "notifications.intake.user_notification")
    _connect("changelog", "Notification", _on_changelog_notification, "notifications.changelog.notification")
    _connect("workflow_engine", "ApprovalTask", _on_approval_task, "notifications.workflow.approval_task")
    try:
        review_model = apps.get_model("marketplace", "Review")
    except LookupError:
        review_model = None
    if review_model is not None:
        from django.db.models.signals import post_save, pre_save
        pre_save.connect(_remember_review_status, sender=review_model, dispatch_uid="notifications.marketplace.review.status")
        post_save.connect(_on_review, sender=review_model, dispatch_uid="notifications.marketplace.review")
    logger.debug("Notification work adapters registered")
