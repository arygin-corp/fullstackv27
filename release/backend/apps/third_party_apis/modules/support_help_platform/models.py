from django.db import models


class SupportCategory(models.Model):
    source_id = models.CharField(max_length=32, unique=True)
    label = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("position", "id")
        verbose_name_plural = "Support categories"

    def __str__(self):
        return self.label


class SupportArticle(models.Model):
    source_id = models.CharField(max_length=80, unique=True)
    category = models.ForeignKey(SupportCategory, on_delete=models.PROTECT, related_name="articles")
    title = models.CharField(max_length=255)
    summary = models.TextField()
    blocks = models.JSONField(default=list)
    image = models.CharField(max_length=255, blank=True)
    walkthrough = models.JSONField(default=list, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.title


class SupportPrompt(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")

    def __str__(self):
        return self.question
