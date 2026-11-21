from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Post, ReleaseStatus
from .notifications import notify_release_published


@transaction.atomic
def submit_for_review(post, actor):
    if post.status != ReleaseStatus.DRAFT:
        raise ValidationError("Only draft releases can be submitted for review.")
    post.status = ReleaseStatus.REVIEW
    post.submitted_by = actor
    post.submitted_at = timezone.now()
    post.approved_by = None
    post.approved_at = None
    post.save()
    return post


@transaction.atomic
def approve_release(post, actor):
    if post.status != ReleaseStatus.REVIEW:
        raise ValidationError("Only releases in review can be approved.")
    post.status = ReleaseStatus.APPROVED
    post.approved_by = actor
    post.approved_at = timezone.now()
    post.save()
    return post


@transaction.atomic
def publish_release(post, actor=None, now=None):
    now = now or timezone.now()
    if post.status != ReleaseStatus.APPROVED:
        raise ValidationError("Only approved releases can be published.")
    if post.publish_at and post.publish_at > now:
        raise ValidationError("This release is scheduled for a future publish time.")
    post.status = ReleaseStatus.PUBLISHED
    post.published_at = now
    if actor is not None:
        post.updated_by = actor
    post.save()
    transaction.on_commit(lambda: notify_release_published(post.pk))
    return post


@transaction.atomic
def archive_release(post, actor=None):
    if post.status != ReleaseStatus.PUBLISHED:
        raise ValidationError("Only published releases can be archived.")
    post.status = ReleaseStatus.ARCHIVED
    if actor is not None:
        post.updated_by = actor
    post.save()
    return post
