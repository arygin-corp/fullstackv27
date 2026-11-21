from django.db import models


class WalkthroughChrome(models.Model):
    layout = models.CharField(max_length=20, unique=True)
    hotspots = models.JSONField(default=list)

    class Meta:
        ordering = ("layout",)
        verbose_name = "What's New chrome"

    def __str__(self):
        return self.layout


class WalkthroughStep(models.Model):
    source_id = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=150)
    summary = models.TextField()
    link = models.CharField(max_length=255)
    link_label = models.CharField(max_length=150)
    image = models.CharField(max_length=255)
    chrome_layout = models.CharField(max_length=20, blank=True)
    hotspots = models.JSONField(default=list)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("position", "id")
        verbose_name = "What's New step"

    def __str__(self):
        return self.title
