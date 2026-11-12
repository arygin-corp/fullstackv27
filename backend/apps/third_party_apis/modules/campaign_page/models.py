from django.db import models


class CampaignAd(models.Model):
    class Kind(models.TextChoices):
        SLIDE = "slide", "Slide"
        HIGHLIGHT = "highlight", "Highlight"
        BANNER = "banner", "Banner"
        BRAND = "brand", "Brand"

    kind = models.CharField(max_length=20, choices=Kind.choices)
    title = models.CharField(max_length=150)
    text = models.CharField(max_length=255, blank=True)
    image = models.CharField(max_length=255, blank=True)
    fragment = models.CharField(max_length=80, blank=True)
    link = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=80, blank=True)
    action_label = models.CharField(max_length=80, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("kind", "position", "id")
        constraints = [
            models.UniqueConstraint(fields=("kind", "title"), name="campaign_ad_kind_title"),
        ]

    def __str__(self):
        return self.title
