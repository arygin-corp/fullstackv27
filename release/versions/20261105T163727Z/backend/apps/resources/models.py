from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from .validators import (
    validate_document_upload, validate_image_upload, validate_media_upload,
    validate_resource_attachment, validate_resource_url,
)


class LifecycleMixin(models.Model):
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(blank=True, null=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True,
        on_delete=models.SET_NULL, related_name="%(app_label)s_%(class)s_archived")
    publish_at = models.DateTimeField(blank=True, null=True, db_index=True)
    expire_at = models.DateTimeField(blank=True, null=True, db_index=True)

    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        if self.publish_at and self.expire_at and self.expire_at <= self.publish_at:
            raise ValidationError({"expire_at": "expire_at must be later than publish_at."})


class Homepage(LifecycleMixin, models.Model):
    title = models.CharField(max_length=150, default=None)
    sub_title = models.CharField(max_length=150, default=None)
    hero_image = models.ImageField(upload_to='marketplace/resources/homepage/cover/', max_length=150, default='default.jpg', validators=[validate_image_upload])
    desc = models.CharField(max_length=150, default=None)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='homepage_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='homepage_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    class Meta:
        verbose_name_plural = 'Home Page'
    def clean(self):
        super().clean()
        if self.is_active and not self.is_archived and Homepage.objects.exclude(pk=self.pk).filter(is_active=True, is_archived=False).exists():
            raise ValidationError({'is_active': 'Only one Homepage may be active.'})
    def __str__(self): return f"{self.title} | {self.sub_title} | {self.is_active}"


class Brand(LifecycleMixin, models.Model):
    image = models.ImageField(upload_to='marketplace/resources/brands/', max_length=150, default='default.svg', validators=[validate_image_upload])
    name = models.CharField(max_length=150, default=None)
    size = models.CharField(max_length=10, default=None)
    desc = models.CharField(max_length=400, default=None)
    download_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='brand_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='brand_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    def __str__(self): return f"{self.name} | {self.size} | {self.is_active}"


class Document(LifecycleMixin, models.Model):
    class ResourceKind(models.TextChoices):
        DOCUMENT='document','Document'; MINDMAP='mindmap','Mind Map'
    cover = models.ImageField(upload_to='marketplace/resources/docs/cover', max_length=150, default='default.svg', validators=[validate_image_upload])
    name = models.CharField(max_length=150, default=None)
    classification = models.CharField(max_length=150, default=None)
    size = models.CharField(max_length=10, default=None)
    file_format = models.CharField(max_length=10, default=None)
    desc = models.CharField(max_length=400, default=None)
    platform = models.ImageField(upload_to='marketplace/resources/docs/platforms/', max_length=150, default='default.svg', validators=[validate_image_upload])
    view_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    download_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    resource_kind = models.CharField(max_length=20, choices=ResourceKind.choices, default=ResourceKind.DOCUMENT, db_index=True)
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='document_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='document_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    @property
    def content_url(self): return self.view_url or self.download_url
    def __str__(self): return f"{self.name} | {self.size} | {self.is_active}"


class Policie(LifecycleMixin, models.Model):
    cover = models.ImageField(upload_to='marketplace/resources/docs/cover', max_length=150, default='default.svg', validators=[validate_image_upload])
    name = models.CharField(max_length=150, default=None)
    classification = models.CharField(max_length=150, default=None)
    size = models.CharField(max_length=10, default=None)
    file_format = models.CharField(max_length=10, default=None)
    desc = models.CharField(max_length=400, default=None)
    platform = models.ImageField(upload_to='marketplace/resources/docs/platforms/', max_length=150, default='default.svg', validators=[validate_image_upload])
    view_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    external_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    download_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='policy_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='policy_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    def __str__(self): return f"{self.name} | {self.size} | {self.is_active}"


class Processe(LifecycleMixin, models.Model):
    cover = models.ImageField(upload_to='marketplace/resources/docs/cover', max_length=150, default='default.svg', validators=[validate_image_upload])
    name = models.CharField(max_length=150, default=None)
    classification = models.CharField(max_length=150, default=None)
    size = models.CharField(max_length=10, default=None)
    file_format = models.CharField(max_length=10, default=None)
    desc = models.CharField(max_length=400, default=None)
    platform = models.ImageField(upload_to='marketplace/resources/docs/platforms/', max_length=150, default='default.svg', validators=[validate_image_upload])
    view_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    download_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='process_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='process_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    def __str__(self): return f"{self.name} | {self.size} | {self.is_active}"


class Media(LifecycleMixin, models.Model):
    media = models.FileField(upload_to='marketplace/resources/media/', max_length=150, default='default.mp4', validators=[validate_media_upload])
    icon = models.ImageField(upload_to='marketplace/resources/icons/', max_length=150, default='default.svg', validators=[validate_image_upload])
    name = models.CharField(max_length=150, default=None)
    size = models.CharField(max_length=10, default=None)
    file_format = models.CharField(max_length=10, default=None)
    date = models.DateTimeField(default=None)
    download_url = models.CharField(max_length=800, default=None, validators=[validate_resource_url])
    is_active = models.BooleanField('Active', default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True, related_name='media_author_create')
    created_at = models.DateField(auto_now_add=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=False, null=True, related_name='media_author_update')
    updated_at = models.DateField(auto_now=True)
    readonly_fields = ('created_by', 'created_at', 'updated_by', 'updated_at')
    class Meta: verbose_name_plural = 'Media'
    def __str__(self): return f"{self.name} | {self.file_format} | {self.is_active}"


class ResourceChangeRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT='DRAFT','Draft'; PENDING='PENDING','Pending'; APPROVED='APPROVED','Approved'; REJECTED='REJECTED','Rejected'; APPLIED='APPLIED','Applied'; CANCELLED='CANCELLED','Cancelled'
    class Action(models.TextChoices):
        CREATE='CREATE','Create'; UPDATE='UPDATE','Update'; PUBLISH='PUBLISH','Publish'; UNPUBLISH='UNPUBLISH','Unpublish'; ARCHIVE='ARCHIVE','Archive'; RESTORE='RESTORE','Restore'
    resource_type = models.ForeignKey(ContentType, on_delete=models.PROTECT, limit_choices_to=Q(app_label='resources', model__in=['homepage','brand','document','policie','processe','media']))
    resource_id = models.PositiveBigIntegerField(blank=True, null=True)
    resource = GenericForeignKey('resource_type','resource_id')
    action = models.CharField(max_length=16, choices=Action.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT, db_index=True)
    proposed_data = models.JSONField(default=dict, blank=True)
    submitter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='resource_change_requests')
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='resource_change_approvals', blank=True, null=True)
    comment = models.TextField(blank=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    decided_at = models.DateTimeField(blank=True, null=True)
    applied_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def clean(self):
        if self.approver_id and self.approver_id == self.submitter_id:
            raise ValidationError({'approver': 'Self approval is prohibited.'})
    def delete(self,*args,**kwargs): raise ValidationError('Change requests cannot be deleted; cancel them instead.')


class ResourceChangeAttachment(models.Model):
    change_request = models.ForeignKey(ResourceChangeRequest, on_delete=models.PROTECT, related_name='attachments')
    file = models.FileField(upload_to='resources/change-attachments/%Y/%m/', validators=[validate_resource_attachment])
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    def delete(self,*args,**kwargs): raise ValidationError('Workflow attachments are retained for audit.')


class ResourceApprovalAudit(models.Model):
    class Event(models.TextChoices):
        SUBMITTED='SUBMITTED','Submitted'; APPROVED='APPROVED','Approved'; REJECTED='REJECTED','Rejected'; APPLIED='APPLIED','Applied'; ARCHIVED='ARCHIVED','Archived'; RESTORED='RESTORED','Restored'; CANCELLED='CANCELLED','Cancelled'; SCHEDULED_PUBLISH='SCHEDULED_PUBLISH','Scheduled publish'; SCHEDULED_ARCHIVE='SCHEDULED_ARCHIVE','Scheduled archive'
    change_request = models.ForeignKey(ResourceChangeRequest, on_delete=models.PROTECT, related_name='audit_events', blank=True, null=True)
    event = models.CharField(max_length=32, choices=Event.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, blank=True, null=True)
    actor_groups = models.JSONField(default=list)
    before_snapshot = models.JSONField(default=dict, blank=True)
    after_snapshot = models.JSONField(default=dict, blank=True)
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    def save(self,*args,**kwargs):
        if self.pk: raise ValidationError('Audit rows are immutable.')
        return super().save(*args,**kwargs)
    def delete(self,*args,**kwargs): raise ValidationError('Audit rows are immutable.')


class ResourceVersion(models.Model):
    resource_type = models.ForeignKey(ContentType, on_delete=models.PROTECT, limit_choices_to=Q(app_label='resources', model__in=['document','policie','processe']))
    resource_id = models.PositiveBigIntegerField()
    resource = GenericForeignKey('resource_type','resource_id')
    version_number = models.PositiveIntegerField()
    snapshot = models.JSONField(default=dict)
    change_request = models.ForeignKey(ResourceChangeRequest, on_delete=models.PROTECT, related_name='versions', blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=['resource_type','resource_id','version_number'], name='resources_unique_version')]
        ordering=['-version_number']
    @property
    def version(self): return f'v{self.version_number}'
    def delete(self,*args,**kwargs): raise ValidationError('Versions are immutable.')


class ResourceAnalytics(models.Model):
    resource_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to=Q(app_label='resources', model__in=['homepage','document','policie','processe','media']))
    resource_id = models.PositiveBigIntegerField()
    resource = GenericForeignKey('resource_type','resource_id')
    visits = models.PositiveBigIntegerField(default=0)
    views = models.PositiveBigIntegerField(default=0)
    downloads = models.PositiveBigIntegerField(default=0)
    opens = models.PositiveBigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints=[models.UniqueConstraint(fields=['resource_type','resource_id'], name='resources_unique_analytics')]
