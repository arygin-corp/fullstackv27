import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from datetime import timedelta

class PageType(models.Model):
    name=models.CharField(max_length=120,unique=True)
    code=models.SlugField(max_length=120,unique=True)
    description=models.TextField(blank=True)
    is_active=models.BooleanField(default=True)
    allow_restricted_html=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=("name",)
    def __str__(self): return self.name

class Page(models.Model):
    title=models.CharField(max_length=255)
    slug=models.SlugField(max_length=255)
    page_type=models.ForeignKey(PageType,on_delete=models.PROTECT,related_name="pages")
    locale=models.CharField(max_length=16,default="en-US")
    published_version=models.ForeignKey("PageVersion",null=True,blank=True,on_delete=models.SET_NULL,related_name="published_for")
    working_version=models.ForeignKey("PageVersion",null=True,blank=True,on_delete=models.SET_NULL,related_name="working_for")
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
    is_archived=models.BooleanField(default=False)
    is_deleted=models.BooleanField(default=False)
    deleted_at=models.DateTimeField(null=True,blank=True)
    purge_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: constraints=[models.UniqueConstraint(fields=("slug","locale"),name="pages_slug_locale_unique")]
    def __str__(self): return self.title
    def soft_delete(self, *args, **kwargs):
        self.is_deleted=True;self.is_archived=True;self.deleted_at=timezone.now();self.purge_at=self.deleted_at+timedelta(days=7);self.save()
    def restore(self):
        if not self.is_deleted or not self.purge_at or self.purge_at<=timezone.now(): raise ValidationError("Page cannot be restored.")
        self.is_deleted=False;self.is_archived=False;self.deleted_at=None;self.purge_at=None;self.save()

class PageVersion(models.Model):
    class Status(models.TextChoices):
        DRAFT="draft","Draft"; REVIEW="review","Review"; APPROVED="approved","Approved"; PUBLISHED="published","Published"; SUPERSEDED="superseded","Superseded"
    page=models.ForeignKey(Page,on_delete=models.CASCADE,related_name="versions")
    number=models.PositiveIntegerField()
    title=models.CharField(max_length=255)
    summary=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.DRAFT)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL)
    is_archived=models.BooleanField(default=False)
    is_deleted=models.BooleanField(default=False)
    deleted_at=models.DateTimeField(null=True,blank=True)
    purge_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        ordering=("-number",)
        constraints=[models.UniqueConstraint(fields=("page","number"),name="pages_version_unique")]
    def __str__(self): return f"{self.page} v{self.number}"

class ContentBlock(models.Model):
    class Type(models.TextChoices):
        TEXT="text","Plain text"; MARKDOWN="markdown","Markdown"; RICH_TEXT="rich_text","Rich text"; HTML="html","Restricted HTML"
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    version=models.ForeignKey(PageVersion,on_delete=models.CASCADE,related_name="blocks")
    block_type=models.CharField(max_length=20,choices=Type.choices)
    label=models.CharField(max_length=150,blank=True)
    position=models.PositiveIntegerField(default=0)
    payload=models.JSONField(default=dict)
    checksum=models.CharField(max_length=64,editable=False,db_index=True)
    is_enabled=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        ordering=("position","created_at")
        constraints=[models.UniqueConstraint(fields=("version","position"),name="pages_block_position_unique")]
    def clean(self):
        from .content_rendering import payload_checksum,validate_block_payload
        self.payload=validate_block_payload(self.block_type,self.payload)
        if self.block_type==self.Type.HTML and not self.version.page.page_type.allow_restricted_html:
            raise ValidationError({"block_type":"This page type does not permit restricted HTML blocks."})
        self.checksum=payload_checksum(self.block_type,self.payload)
    def save(self,*args,**kwargs): self.full_clean(); return super().save(*args,**kwargs)

class ReviewRequirement(models.Model):
    class Type(models.TextChoices): CONTENT="content","Content"; PRODUCT="product","Product"; LEGAL="legal","Legal"; SECURITY="security","Security"
    version=models.ForeignKey(PageVersion,on_delete=models.CASCADE,related_name="requirements")
    review_type=models.CharField(max_length=20,choices=Type.choices)
    group_name=models.CharField(max_length=150)
    required_approvals=models.PositiveSmallIntegerField(default=1)
    class Meta: constraints=[models.UniqueConstraint(fields=("version","review_type"),name="v2_requirement_unique")]

class Approval(models.Model):
    class Decision(models.TextChoices): APPROVED="approved","Approved"; COMMENTS="approved-with-comments","Approved with comments"; REVISION="revision-requested","Revision requested"; REJECTED="rejected","Rejected"; ABSTAINED="abstained","Abstained"
    requirement=models.ForeignKey(ReviewRequirement,on_delete=models.CASCADE,related_name="decisions")
    reviewer=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT)
    reviewer_group_name=models.CharField(max_length=150)
    decision=models.CharField(max_length=32,choices=Decision.choices)
    comment=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: constraints=[models.UniqueConstraint(fields=("requirement","reviewer"),name="v2_reviewer_decision_unique")]
    def clean(self):
        minimum=50 if self.decision==self.Decision.REJECTED else 25
        if len((self.comment or "").strip())<minimum: raise ValidationError({"comment":f"At least {minimum} characters required."})
    def save(self,*args,**kwargs): self.comment=(self.comment or "").strip();self.full_clean();return super().save(*args,**kwargs)

class WorkflowTask(models.Model):
    class Status(models.TextChoices): OPEN="open","Open"; COMPLETED="completed","Completed"; CANCELED="canceled","Canceled"
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    requirement=models.OneToOneField(ReviewRequirement,on_delete=models.CASCADE,related_name="task")
    page=models.ForeignKey(Page,on_delete=models.CASCADE,related_name="tasks")
    version=models.ForeignKey(PageVersion,on_delete=models.CASCADE,related_name="tasks")
    assigned_group_name=models.CharField(max_length=150)
    status=models.CharField(max_length=12,choices=Status.choices,default=Status.OPEN)
    due_at=models.DateTimeField(null=True,blank=True)
    completed_at=models.DateTimeField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

class LifecycleRequest(models.Model):
    class Type(models.TextChoices): ARCHIVE="archive","Archive"; DELETE="delete","Delete"
    class Status(models.TextChoices): PENDING="pending","Pending"; APPROVED="approved","Approved"; REJECTED="rejected","Rejected"
    page=models.ForeignKey(Page,on_delete=models.CASCADE,related_name="lifecycle_requests")
    request_type=models.CharField(max_length=10,choices=Type.choices)
    status=models.CharField(max_length=10,choices=Status.choices,default=Status.PENDING)
    reason=models.TextField()
    requested_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,related_name="v2_lifecycle_requests")
    decided_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.PROTECT,related_name="v2_lifecycle_decisions")
    decision_comment=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    decided_at=models.DateTimeField(null=True,blank=True)

class AuditEvent(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    page=models.ForeignKey(Page,null=True,blank=True,on_delete=models.SET_NULL,related_name="audit_events")
    page_slug_snapshot=models.CharField(max_length=255)
    version_number=models.PositiveIntegerField(null=True,blank=True)
    action=models.CharField(max_length=80)
    actor=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.SET_NULL, related_name="page_audit_events")
    details=models.JSONField(default=dict,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=("-created_at",)
    def save(self,*args,**kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists(): raise ValidationError("Audit events are immutable.")
        return super().save(*args,**kwargs)
    def delete(self,*args,**kwargs): raise ValidationError("Audit events cannot be deleted.")

class NotificationPreference(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="master_pages_preferences")
    email_enabled=models.BooleanField(default=True);in_app_enabled=models.BooleanField(default=True);alert_enabled=models.BooleanField(default=False)

class NotificationDelivery(models.Model):
    class Status(models.TextChoices): PENDING="pending","Pending"; SENT="sent","Sent"; FAILED="failed","Failed"
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    recipient=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="master_pages_notifications")
    channel=models.CharField(max_length=12,choices=(("email","Email"),("in-app","In-app"),("alert","Alert")))
    status=models.CharField(max_length=10,choices=Status.choices,default=Status.PENDING)
    subject=models.CharField(max_length=255);body_text=models.TextField();action_url=models.CharField(max_length=500,blank=True);payload=models.JSONField(default=dict,blank=True);created_at=models.DateTimeField(auto_now_add=True)

class MediaAsset(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    file=models.FileField(upload_to="master-pages/%Y/%m/");original_name=models.CharField(max_length=255);content_type=models.CharField(max_length=150);size=models.PositiveBigIntegerField();alt_text=models.CharField(max_length=500,blank=True);checksum=models.CharField(max_length=64,db_index=True);uploaded_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);scan_status=models.CharField(max_length=20,default="pending",choices=(("pending","Pending"),("clean","Clean"),("rejected","Rejected")));created_at=models.DateTimeField(auto_now_add=True)

class ScheduledPublication(models.Model):
    class Action(models.TextChoices): PUBLISH="publish","Publish"; UNPUBLISH="unpublish","Unpublish"
    class Status(models.TextChoices): PENDING="pending","Pending"; COMPLETED="completed","Completed"; FAILED="failed","Failed"; CANCELED="canceled","Canceled"
    page=models.ForeignKey(Page,on_delete=models.CASCADE,related_name="schedules");version=models.ForeignKey(PageVersion,null=True,blank=True,on_delete=models.CASCADE);action=models.CharField(max_length=12,choices=Action.choices);execute_at=models.DateTimeField(db_index=True);status=models.CharField(max_length=12,choices=Status.choices,default=Status.PENDING);requested_by=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,on_delete=models.SET_NULL);error=models.TextField(blank=True);created_at=models.DateTimeField(auto_now_add=True)
