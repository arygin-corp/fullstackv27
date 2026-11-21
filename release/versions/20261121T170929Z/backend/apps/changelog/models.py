from django.conf import settings
from django.db import models
from django.utils import timezone
from django_ckeditor_5.fields import CKEditor5Field

RELEASE_TYPE = sorted([
    ("New", "New"), ("Enhancements", "Enhancements"),
    ("Feature", "Feature"), ("Updates", "Updates"),
    ("Remove", "Remove"), ("Fixes", "Fixes"), ("Issues", "Issues"),
], key=lambda value: value[1])

RELEASE_TITLE = sorted([
    ("New Enhancements", "New Enhancements"),
    ("New Feature", "New Feature"),
    ("New Products", "New Products"),
    ("New Domains", "New Domains"),
    ("New Updates", "New Updates"),
    ("New Bug Fixes", "New Bug Fixes"),
    ("New Issues", "New Issues"),
    ("New Enhancements & Products", "New Enhancements & Products"),
    ("New Enhancements & Features", "New Enhancements & Features"),
    ("New Enhancements & Updates", "New Enhancements & Updates"),
    ("New Enhancements & Bug Fixes", "New Enhancements & Bug Fixes"),
    ("New Enhancements, Products, & Updates", "New Enhancements, Products, & Updates"),
    ("New Enhancements, Products, & Bug Fixes", "New Enhancements, Products, & Bug Fixes"),
    ("New Enhancements, Products, Updates, & Bug Fixes", "New Enhancements, Products, Updates, & Bug Fixes"),
    ("New Products & Features", "New Products & Features"),
    ("New Products & Bug Fixes", "New Products & Bug Fixes"),
    ("New Products, Updates, & Bug Fixes", "New Products, Updates, & Bug Fixes"),
    ("New Products & Updates", "New Products & Updates"),
    ("New Updates & Bug Fixes", "New Updates & Bug Fixes"),
    ("New Feature, Products, Updates, Enhancements, & Bug Fixes", "New Features, Products, Updates, Enhancements, & Bug Fixes"),
], key=lambda value: value[1])

SUBTITLE_CHOICES = sorted([
    ("Enhance Core", "Enhance Core"), ("New Feature", "New Feature"),
    ("New Domains", "New Domains"), ("New Subdomains", "New Subdomains"),
    ("New Products", "New Products"), ("New Updates", "New Updates"),
    ("Resolved Bug Fixes", "Resolved Bug Fixes"),
    ("Resolved Issues", "Resolved Issues"),
], key=lambda value: value[1])

class Categorie(models.Model):
    name = models.CharField(max_length=150, choices=RELEASE_TYPE)
    slug = models.SlugField(max_length=150, unique=True)
    published_date = models.DateTimeField()
    desc = CKEditor5Field("Description", config_name="extends")
    is_active = models.BooleanField("Active", default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="changelog_category_author")
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="changelog_category_updater")
    updated_at = models.DateField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.name} | {self.is_active}"

class ReleaseStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    REVIEW = "REVIEW", "In review"
    APPROVED = "APPROVED", "Approved"
    PUBLISHED = "PUBLISHED", "Published"
    ARCHIVED = "ARCHIVED", "Archived"


class Post(models.Model):
    version = models.CharField(max_length=150, db_index=True)
    release_date = models.DateTimeField(db_index=True)
    title = models.CharField(max_length=160, choices=RELEASE_TITLE)
    desc = models.CharField(max_length=150, default="We just release a new version!")
    subTitleA = models.CharField(max_length=160)
    typeA = models.ForeignKey(Categorie, related_name="type1", on_delete=models.PROTECT)
    postA = CKEditor5Field("Brief Description", config_name="extends")
    subTitleB = models.CharField(max_length=160, blank=True, null=True)
    typeB = models.ForeignKey(Categorie, blank=True, null=True, related_name="type2", on_delete=models.PROTECT)
    postB = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleC = models.CharField(max_length=160, blank=True, null=True)
    typeC = models.ForeignKey(Categorie, blank=True, null=True, related_name="type3", on_delete=models.PROTECT)
    postC = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleD = models.CharField(max_length=160, blank=True, null=True)
    typeD = models.ForeignKey(Categorie, blank=True, null=True, related_name="type4", on_delete=models.PROTECT)
    postD = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleE = models.CharField(max_length=160, blank=True, null=True)
    typeE = models.ForeignKey(Categorie, blank=True, null=True, related_name="type5", on_delete=models.PROTECT)
    postE = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleF = models.CharField(max_length=160, blank=True, null=True)
    typeF = models.ForeignKey(Categorie, blank=True, null=True, related_name="type6", on_delete=models.PROTECT)
    postF = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleG = models.CharField(max_length=160, blank=True, null=True)
    typeG = models.ForeignKey(Categorie, blank=True, null=True, related_name="type7", on_delete=models.PROTECT)
    postG = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleH = models.CharField(max_length=160, blank=True, null=True)
    typeH = models.ForeignKey(Categorie, blank=True, null=True, related_name="type8", on_delete=models.PROTECT)
    postH = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleI = models.CharField(max_length=160, blank=True, null=True)
    typeI = models.ForeignKey(Categorie, blank=True, null=True, related_name="type9", on_delete=models.PROTECT)
    postI = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    subTitleJ = models.CharField(max_length=160, blank=True, null=True)
    typeJ = models.ForeignKey(Categorie, blank=True, null=True, related_name="type10", on_delete=models.PROTECT)
    postJ = CKEditor5Field("Brief Description", config_name="extends", blank=True, null=True)
    # Kept for compatibility with existing clients. Workflow code keeps this
    # synchronized with status == PUBLISHED.
    is_active = models.BooleanField("Active", default=False, db_index=True)
    status = models.CharField(
        max_length=12, choices=ReleaseStatus.choices,
        default=ReleaseStatus.DRAFT, db_index=True,
    )
    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="changelog_posts_submitted",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        related_name="changelog_posts_approved",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="changelog_post_author_create")
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name="changelog_post_author_update")
    updated_at = models.DateField(auto_now=True)

    def save(self, *args, **kwargs):
        self.is_active = self.status == ReleaseStatus.PUBLISHED
        if self.is_active and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def is_publishable(self):
        return self.status == ReleaseStatus.APPROVED

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        ordering = ["-release_date", "-id"]
        permissions = [("approve_post", "Can approve changelog releases"), ("publish_post", "Can publish and archive changelog releases")]

    def __str__(self):
        return f"{self.version} | {self.title}"

class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        READ = "READ", "Read"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="changelog_audit_events")
    actor_username = models.CharField(max_length=150, blank=True)
    actor_email = models.EmailField(blank=True)
    action = models.CharField(max_length=10, choices=Action.choices, db_index=True)
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=255, db_index=True)
    object_repr = models.CharField(max_length=255, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    snapshot = models.JSONField(default=dict, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]
        permissions = [("view_all_audit_logs", "Can view all changelog audit logs")]
        indexes = [
            models.Index(fields=["model_name", "object_id", "-created_at"], name="chg_obj_audit_idx"),
            models.Index(fields=["actor", "-created_at"], name="chg_actor_audit_idx"),
        ]

    def __str__(self):
        return f"{self.action} {self.model_name} {self.object_id} by {self.actor_username or 'system'}"


class ReleaseSubscription(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="changelog_subscription",
    )
    email_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Changelog subscription for {self.user}"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="changelog_notifications",
    )
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "post"], name="unique_release_notification"
            )
        ]

    def mark_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])

    def __str__(self):
        return f"{self.title} for {self.user}"
