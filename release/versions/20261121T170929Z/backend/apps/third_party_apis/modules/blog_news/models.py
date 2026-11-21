from django.db import models


class NewsPost(models.Model):
    class ApprovalStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending Approval"
        APPROVED = "approved", "Approved"

    source_id = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField()
    content = models.TextField()
    image = models.CharField(max_length=255, blank=True)
    author = models.CharField(max_length=150, blank=True)
    author_image = models.CharField(max_length=255, blank=True)
    published_on = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=50, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        db_index=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("source_id",)

    def __str__(self):
        return self.title
