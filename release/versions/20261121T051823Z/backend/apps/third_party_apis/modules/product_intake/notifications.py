from django.contrib.auth import get_user_model
from django.urls import reverse

from .access import WORKFLOW_GROUPS
from .models import NotificationOutbox, UserNotification

User = get_user_model()


def create_notification(*, intake, email, first_name="", last_name="", event, severity, title, message):
    if not email:
        return None
    return UserNotification.objects.create(
        recipient_email=email.strip().casefold(), recipient_first_name=first_name,
        recipient_last_name=last_name, intake=intake, event=event, severity=severity,
        title=title, message=message,
        action_url=reverse("intake:intake-detail", args=[intake.pk]),
    )


def queue_email(*, intake, email, event, template):
    if not email:
        return None
    return NotificationOutbox.objects.create(
        event_type=event, intake=intake, recipient=email.strip().casefold(),
        template_name=template, payload={"intake_id": intake.pk},
    )


def workflow_users():
    return User.objects.filter(is_active=True, groups__name__in=WORKFLOW_GROUPS).exclude(email="").distinct()


def notify_submission(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="intake_submitted", severity="success", title="Intake submitted",
        message=f"Intake #{intake.pk} was submitted successfully.")
    queue_email(intake=intake, email=intake.requester_email, event="intake_submitted", template="submission")
    for user in workflow_users():
        create_notification(intake=intake, email=user.email, first_name=user.first_name,
            last_name=user.last_name, event="review_required", severity="warning",
            title="New intake awaiting review", message=f"Intake #{intake.pk} requires review.")
        queue_email(intake=intake, email=user.email, event="review_required", template="review_required")


def notify_rejection(intake):
    message = (f"Intake #{intake.pk} was rejected. Reason: {intake.rejection_reason}. "
               f"Reviewer comments: {intake.rejection_comments}")
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="intake_rejected", severity="error", title="Intake rejected", message=message)
    queue_email(intake=intake, email=intake.requester_email, event="intake_rejected", template="rejection")


def notify_approval(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="intake_approved", severity="success", title="Intake approved",
        message=f"Intake #{intake.pk} was approved. It can now be added as a draft Marketplace product.")
    queue_email(intake=intake, email=intake.requester_email, event="intake_approved", template="approval")


def notify_draft_product(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="product_drafted", severity="info", title="Draft product created",
        message=f"Intake #{intake.pk} was added as a draft Marketplace product. It is not published.")
    queue_email(intake=intake, email=intake.requester_email, event="product_drafted", template="product_drafted")


def notify_curated(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="product_curated", severity="info", title="Product curated",
        message=f"{intake.product_name} has been curated and is ready to activate on Data Marketplace.")
    queue_email(intake=intake, email=intake.requester_email, event="product_curated", template="product_curated")


def notify_resubmission(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="intake_resubmitted", severity="info", title="Intake resubmitted",
        message=f"Intake #{intake.pk} was resubmitted for review.")
    for user in workflow_users():
        create_notification(intake=intake, email=user.email, first_name=user.first_name,
            last_name=user.last_name, event="review_required", severity="warning",
            title="Intake resubmitted", message=f"Intake #{intake.pk} requires review.")


def notify_product_available(intake):
    create_notification(intake=intake, email=intake.requester_email,
        first_name=intake.requester_first_name, last_name=intake.requester_last_name,
        event="product_available", severity="success", title="Product available",
        message=f"{intake.product_name} is now active and available in Marketplace.")
    queue_email(intake=intake, email=intake.requester_email, event="product_available", template="product_available")
